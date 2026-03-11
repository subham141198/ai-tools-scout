
"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useFirestore, useCollection, useUser } from "@/firebase";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Check, X, ExternalLink, ShieldCheck, Bell, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch pending submissions
  const submissionsQuery = query(
    collection(db, "submissions"), 
    where("status", "==", "pending")
  );
  const { data: submissions, loading: dataLoading } = useCollection<any>(submissionsQuery);

  // Fetch recent notifications
  const notificationsQuery = query(
    collection(db, "notifications"),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  const { data: notifications } = useCollection<any>(notificationsQuery);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background">Authenticating Admin...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 text-center bg-background">
        <ShieldCheck className="h-16 w-16 text-muted-foreground opacity-20" />
        <div className="space-y-2">
          <h1 className="text-2xl font-black">Admin Access Required</h1>
          <p className="text-muted-foreground">Please sign in with your administrator account to continue.</p>
        </div>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
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
      ...cleanData,
      status: 'approved',
      approved: true,
      featured: false,
      rating: 4.0,
      createdAt: new Date().toISOString()
    };

    addDoc(toolsRef, newTool)
      .then(() => {
        updateDoc(submissionRef, { status: 'approved' })
          .then(() => {
            // Log the approval notification
            addDoc(notificationsRef, {
              message: `Approved Tool: ${submission.name}`,
              type: 'approval',
              targetId: submission.id,
              createdAt: serverTimestamp(),
              read: false
            });

            setProcessingId(null);
            toast({
              title: "Tool Approved!",
              description: `${submission.name} is now live. Notification sent to ${submission.contactEmail}.`,
            });
          })
          .catch(async (err) => {
            const pErr = new FirestorePermissionError({ path: submissionRef.path, operation: 'update' });
            errorEmitter.emit('permission-error', pErr);
          });
      })
      .catch(async (err) => {
        const pErr = new FirestorePermissionError({ path: toolsRef.path, operation: 'create' });
        errorEmitter.emit('permission-error', pErr);
      });
  };

  const handleReject = async (submission: any) => {
    setProcessingId(submission.id);
    const submissionRef = doc(db, 'submissions', submission.id);
    const notificationsRef = collection(db, 'notifications');

    updateDoc(submissionRef, { status: 'rejected' })
      .then(() => {
        addDoc(notificationsRef, {
          message: `Rejected Tool: ${submission.name}`,
          type: 'rejection',
          targetId: submission.id,
          createdAt: serverTimestamp(),
          read: false
        });

        setProcessingId(null);
        toast({
          title: "Submission Rejected",
          description: "Archive updated. Notification sent.",
          variant: "destructive"
        });
      })
      .catch(async (err) => {
        const pErr = new FirestorePermissionError({ path: submissionRef.path, operation: 'update' });
        errorEmitter.emit('permission-error', pErr);
      });
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-8">
            <div className="space-y-1">
              <h1 className="text-4xl font-headline font-black flex items-center gap-3">
                <ShieldCheck className="h-10 w-10 text-primary" />
                Moderation Center
              </h1>
              <p className="text-muted-foreground font-medium">Global AI tool administration and notifications.</p>
            </div>
          </div>

          <Tabs defaultValue="submissions" className="space-y-8">
            <TabsList className="bg-card border h-12 p-1 rounded-full w-full max-w-md">
              <TabsTrigger value="submissions" className="flex-1 rounded-full font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                Submissions ({submissions?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 rounded-full font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                <Bell className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submissions" className="space-y-6">
              {dataLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="font-bold text-muted-foreground">Syncing Intelligence Hub...</p>
                </div>
              ) : !submissions || submissions.length === 0 ? (
                <Card className="border-2 border-dashed p-20 text-center">
                  <Check className="h-16 w-16 text-primary/20 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">Queue Cleared</h2>
                  <p className="text-muted-foreground">No pending tools to review.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {submissions.map((sub: any) => (
                    <Card key={sub.id} className="overflow-hidden border-none shadow-xl rounded-[2rem]">
                      <CardHeader className="bg-muted/30 p-8 border-b">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-2xl font-black">{sub.name}</CardTitle>
                              <Badge variant="outline">{sub.pricingModel}</Badge>
                            </div>
                            <p className="text-muted-foreground font-medium italic">"{sub.shortDescription}"</p>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              variant="destructive" 
                              className="rounded-full px-6 font-bold"
                              onClick={() => handleReject(sub)}
                              disabled={processingId === sub.id}
                            >
                              {processingId === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                              Reject
                            </Button>
                            <Button 
                              className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-8 font-bold shadow-lg"
                              onClick={() => handleApprove(sub)}
                              disabled={processingId === sub.id}
                            >
                              {processingId === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                              Approve
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Submitter</p>
                              <p className="font-bold">{sub.contactEmail}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Website</p>
                              <a href={sub.websiteUrl} target="_blank" className="text-primary font-bold flex items-center gap-1">
                                Visit Site <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                          <div className="md:col-span-2">
                             <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Long Description</p>
                             <div className="text-sm bg-muted/20 p-4 rounded-xl max-h-32 overflow-y-auto whitespace-pre-line text-muted-foreground">
                               {sub.longDescription}
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
               <Card className="border-none shadow-xl rounded-[2rem]">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <History className="h-5 w-5 text-primary" />
                     Recent Activity Logs
                   </CardTitle>
                   <CardDescription>Real-time updates of submissions and administrative actions.</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     {!notifications || notifications.length === 0 ? (
                       <p className="text-center py-10 text-muted-foreground">No recent activity found.</p>
                     ) : (
                       notifications.map((notif: any) => (
                         <div key={notif.id} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/20 border border-muted/30">
                           <div className={`p-2 rounded-lg shrink-0 ${
                             notif.type === 'new_submission' ? 'bg-blue-100 text-blue-600' :
                             notif.type === 'approval' ? 'bg-emerald-100 text-emerald-600' :
                             'bg-rose-100 text-rose-600'
                           }`}>
                             <Bell className="h-4 w-4" />
                           </div>
                           <div className="flex-1">
                             <p className="font-bold text-sm">{notif.message}</p>
                             <p className="text-[10px] text-muted-foreground">
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
