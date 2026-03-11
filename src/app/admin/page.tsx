"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { useFirestore, useCollection, useUser, useAuth } from "@/firebase";
import { ADMIN_EMAILS } from "@/lib/db";
import { 
  collection, 
  query, 
  where, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit
} from "firebase/firestore";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X, ExternalLink, ShieldCheck, Bell, History, LogIn, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Check if current user is an admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");

  // Memoize queries to prevent infinite re-render loops
  const submissionsQuery = useMemo(() => {
    if (!isAdmin || !db) return null;
    return query(
      collection(db, "submissions"), 
      where("status", "==", "pending")
    );
  }, [isAdmin, db]);

  const notificationsQuery = useMemo(() => {
    if (!isAdmin || !db) return null;
    return query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
  }, [isAdmin, db]);

  const { data: submissions, loading: dataLoading } = useCollection<any>(submissionsQuery);
  const { data: notifications } = useCollection<any>(notificationsQuery);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome back",
        description: "Authenticated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background font-bold text-primary animate-pulse">Authenticating Moderator...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center space-y-4 pt-12">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-black">Moderator Login</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">Enter your credentials to manage the AI directory.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@aitoolscout.com" 
                  required 
                  className="rounded-xl h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="rounded-xl h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
                Sign In
              </Button>
              <div className="text-center">
                <Button variant="link" asChild className="text-muted-foreground text-sm font-bold">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Unauthorized view
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 text-center bg-background px-4">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-4 max-w-md">
          <h1 className="text-3xl font-black">Access Denied</h1>
          <p className="text-muted-foreground font-medium">
            Your account <strong>{user.email}</strong> is not authorized to access this dashboard.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-full px-8 font-bold" onClick={handleSignOut}>
            Sign Out
          </Button>
          <Button size="lg" className="rounded-full px-8 font-bold" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleApprove = async (submission: any) => {
    setProcessingId(submission.id);
    const submissionRef = doc(db, 'submissions', submission.id);
    const toolsRef = collection(db, 'tools');
    const notificationsRef = collection(db, 'notifications');

    const { id, ...cleanData } = submission;
    const newTool = {
      name: cleanData.name,
      slug: cleanData.slug || cleanData.name.toLowerCase().replace(/\s+/g, '-'),
      tagline: cleanData.shortDescription || "",
      description: cleanData.longDescription || "",
      websiteUrl: cleanData.websiteUrl,
      pricingModel: cleanData.pricingModel || "Freemium",
      logoUrl: cleanData.logoUrl || `https://picsum.photos/seed/${id}/400/400`,
      professionCategories: cleanData.professions || [],
      workCategories: cleanData.workTypes || [],
      features: [],
      pros: [],
      cons: [],
      rating: 4.0,
      featured: false,
      approved: true,
      createdAt: new Date().toISOString(),
      seoTitle: cleanData.seoTitle,
      metaDescription: cleanData.metaDescription
    };

    addDoc(toolsRef, newTool)
      .then(() => {
        updateDoc(submissionRef, { status: 'approved' })
          .then(() => {
            addDoc(notificationsRef, {
              message: `SUCCESS: Tool Approved - ${submission.name}`,
              type: 'approval',
              targetId: submission.id,
              createdAt: serverTimestamp(),
              read: false
            });
            setProcessingId(null);
            toast({
              title: "Tool Approved!",
              description: `${submission.name} is now live.`,
            });
          })
          .catch(() => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: submissionRef.path, operation: 'update' }));
          });
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: toolsRef.path, operation: 'create' }));
      });
  };

  const handleReject = async (submission: any) => {
    setProcessingId(submission.id);
    const submissionRef = doc(db, 'submissions', submission.id);
    const notificationsRef = collection(db, 'notifications');

    updateDoc(submissionRef, { status: 'rejected' })
      .then(() => {
        addDoc(notificationsRef, {
          message: `REJECTED: Submission Denied - ${submission.name}`,
          type: 'rejection',
          targetId: submission.id,
          createdAt: serverTimestamp(),
          read: false
        });
        setProcessingId(null);
        toast({
          title: "Submission Rejected",
          description: "Archived as rejected.",
          variant: "destructive"
        });
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: submissionRef.path, operation: 'update' }));
      });
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
            <div className="space-y-1">
              <h1 className="text-4xl font-headline font-black flex items-center gap-3">
                <ShieldCheck className="h-10 w-10 text-primary" />
                Moderation Hub
              </h1>
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold w-fit border border-emerald-100">
                <Check className="h-3 w-3" />
                Secure Session
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border shadow-sm">
              <div className="px-4 text-right">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Logged In As</p>
                <p className="text-sm font-bold truncate max-w-[150px]">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-xl">Sign Out</Button>
            </div>
          </div>

          <Tabs defaultValue="submissions" className="space-y-8">
            <TabsList className="bg-card border h-14 p-1.5 rounded-2xl w-full max-w-md">
              <TabsTrigger value="submissions" className="flex-1 rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                Queue ({submissions?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                <Bell className="h-4 w-4 mr-2" />
                Live Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submissions" className="space-y-6">
              {dataLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="font-bold text-muted-foreground">Syncing Database...</p>
                </div>
              ) : !submissions || submissions.length === 0 ? (
                <Card className="border-2 border-dashed p-24 text-center bg-card rounded-[3rem]">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Review Queue Empty</h2>
                  <p className="text-muted-foreground mt-2">All submitted tools have been moderated.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {submissions.map((sub: any) => (
                    <Card key={sub.id} className="overflow-hidden border shadow-xl rounded-[2.5rem] bg-card">
                      <CardHeader className="bg-muted/30 p-8 border-b">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-3xl font-black">{sub.name}</CardTitle>
                              <Badge variant="outline" className="font-bold border-primary/20 text-primary">{sub.pricingModel}</Badge>
                            </div>
                            <p className="text-muted-foreground font-medium italic text-lg">"{sub.shortDescription}"</p>
                          </div>
                          <div className="flex gap-4">
                            <Button 
                              variant="outline" 
                              className="rounded-full px-8 font-bold border-destructive text-destructive hover:bg-destructive hover:text-white"
                              onClick={() => handleReject(sub)}
                              disabled={processingId === sub.id}
                            >
                              {processingId === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                              Reject
                            </Button>
                            <Button 
                              className="bg-primary hover:bg-primary/90 rounded-full px-10 font-bold shadow-lg shadow-primary/20"
                              onClick={() => handleApprove(sub)}
                              disabled={processingId === sub.id}
                            >
                              {processingId === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                              Approve Tool
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                          <div className="lg:col-span-4 space-y-6">
                            <div className="p-4 bg-muted/20 rounded-2xl border border-muted-foreground/10 space-y-4">
                              <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Submitter Detail</p>
                                <p className="font-bold text-sm">{sub.contactEmail}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Source Domain</p>
                                <a href={sub.websiteUrl} target="_blank" className="text-primary font-bold flex items-center gap-1 hover:underline">
                                  {sub.websiteUrl} <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <div className="pt-2">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Selected Roles</p>
                                <div className="flex flex-wrap gap-2">
                                  {sub.professions?.map((p: string) => (
                                    <Badge key={p} variant="secondary" className="capitalize text-[10px]">{p.replace('-', ' ')}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="lg:col-span-8 space-y-6">
                             <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">AI-Generated SEO Content</p>
                                <div className="bg-muted/10 p-6 rounded-2xl border border-dashed border-muted-foreground/20 max-h-[400px] overflow-y-auto">
                                   <div className="mb-6 pb-6 border-b border-dashed">
                                      <h4 className="font-black text-sm text-primary mb-1">SEO Title</h4>
                                      <p className="font-bold italic">"{sub.seoTitle || "N/A"}"</p>
                                   </div>
                                   <div className="prose prose-sm prose-slate max-w-none whitespace-pre-line text-muted-foreground font-medium">
                                     {sub.longDescription || "No detailed description provided."}
                                   </div>
                                </div>
                             </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity">
               <Card className="border shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
                 <CardHeader className="bg-primary/5 p-8 border-b">
                   <div className="flex items-center gap-3">
                     <History className="h-6 w-6 text-primary" />
                     <CardTitle>Global Activity Log</CardTitle>
                   </div>
                   <CardDescription className="text-base">Real-time record of all administrative actions.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8">
                   <div className="space-y-4">
                     {!notifications || notifications.length === 0 ? (
                       <div className="text-center py-20">
                          <History className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">No recent activity recorded.</p>
                       </div>
                     ) : (
                       notifications.map((notif: any) => (
                         <div key={notif.id} className="flex items-start gap-4 p-5 rounded-2xl bg-muted/10 border border-muted/20 hover:border-primary/20 transition-colors">
                           <div className={`p-2.5 rounded-xl shrink-0 ${
                             notif.type === 'new_submission' ? 'bg-blue-100 text-blue-600' :
                             notif.type === 'approval' ? 'bg-emerald-100 text-emerald-600' :
                             'bg-rose-100 text-rose-600'
                           }`}>
                             <Bell className="h-5 w-5" />
                           </div>
                           <div className="flex-1">
                             <p className="font-bold text-base leading-tight mb-1">{notif.message}</p>
                             <p className="text-xs text-muted-foreground font-medium">
                               {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString() : 'Just now'}
                             </p>
                           </div>
                         </div>
                       ))
                     )}
                   </div>
                 </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
