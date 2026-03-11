
"use client";

import { useState } from "react";
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
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Authorization Check
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");

  // Fetch pending submissions (only if admin)
  const submissionsQuery = isAdmin ? query(
    collection(db, "submissions"), 
    where("status", "==", "pending")
  ) : null;
  const { data: submissions, loading: dataLoading } = useCollection<any>(submissionsQuery);

  // Fetch recent notifications (only if admin)
  const notificationsQuery = isAdmin ? query(
    collection(db, "notifications"),
    orderBy("createdAt", "desc"),
    limit(20)
  ) : null;
  const { data: notifications } = useCollection<any>(notificationsQuery);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background font-bold text-primary animate-pulse">Authenticating Moderator...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 text-center bg-background px-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="text-3xl font-black">Moderator Access</h1>
          <p className="text-muted-foreground font-medium">Please sign in with your administrative account to manage submissions and notifications.</p>
        </div>
        <Button size="lg" className="rounded-full px-8 gap-2 font-bold" onClick={handleSignIn}>
          <LogIn className="h-5 w-5" />
          Sign in with Google
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
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
        <div className="space-y-2 max-w-sm">
          <h1 className="text-3xl font-black">Access Denied</h1>
          <p className="text-muted-foreground font-medium">
            The account <strong>{user.email}</strong> does not have moderator privileges. Please contact the site owner or switch to an authorized account.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-full px-8 font-bold" onClick={() => auth.signOut()}>
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
              description: `${submission.name} is now live in the directory.`,
            });
          })
          .catch(async (err) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: submissionRef.path, operation: 'update' }));
          });
      })
      .catch(async (err) => {
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
          description: "Submission has been archived as rejected.",
          variant: "destructive"
        });
      })
      .catch(async (err) => {
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
              <p className="text-muted-foreground font-medium">Review pending AI tool submissions and track platform activity.</p>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border shadow-sm">
              <div className="px-4 text-right">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Signed In As</p>
                <p className="text-sm font-bold truncate max-w-[150px]">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => auth.signOut()} className="rounded-xl">Sign Out</Button>
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
                  <p className="font-bold text-muted-foreground">Syncing Submission Database...</p>
                </div>
              ) : !submissions || submissions.length === 0 ? (
                <Card className="border-2 border-dashed p-24 text-center bg-card rounded-[3rem]">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Review Queue Empty</h2>
                  <p className="text-muted-foreground mt-2">All submitted tools have been moderated. Good job!</p>
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
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">AI-Generated SEO Analysis</p>
                                <div className="bg-muted/10 p-6 rounded-2xl border border-dashed border-muted-foreground/20 max-h-[400px] overflow-y-auto">
                                   <div className="mb-6 pb-6 border-b border-dashed">
                                      <h4 className="font-black text-sm text-primary mb-1">Generated SEO Title</h4>
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
                   <CardDescription className="text-base">A real-time record of all submissions and administrative actions.</CardDescription>
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
