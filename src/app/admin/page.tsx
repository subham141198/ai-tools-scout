
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useFirestore, useAuth, useCollection, useUser } from "@/firebase";
import { 
  collection, 
  query, 
  where, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, ExternalLink, ShieldCheck } from "lucide-react";
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

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Authenticating Admin...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 text-center">
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

    // 1. Move to live tools
    const { id, ...cleanData } = submission;
    const newTool = {
      ...cleanData,
      status: 'approved',
      approved: true,
      featured: false,
      rating: 4.0, // Default rating for new tools
      createdAt: new Date().toISOString()
    };

    addDoc(toolsRef, newTool)
      .then(() => {
        // 2. Update submission status
        updateDoc(submissionRef, { status: 'approved' })
          .then(() => {
            setProcessingId(null);
            toast({
              title: "Tool Approved!",
              description: `${submission.name} is now live in the directory.`,
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

  const handleReject = async (id: string) => {
    setProcessingId(id);
    const submissionRef = doc(db, 'submissions', id);

    updateDoc(submissionRef, { status: 'rejected' })
      .then(() => {
        setProcessingId(null);
        toast({
          title: "Submission Rejected",
          description: "The submission has been archived as rejected.",
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
              <p className="text-muted-foreground font-medium">Review and approve global AI tool submissions.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-card px-6 py-2 rounded-2xl border text-center">
                <p className="text-xs font-black uppercase text-muted-foreground/60 tracking-widest">Pending</p>
                <p className="text-2xl font-black">{submissions?.length || 0}</p>
              </div>
            </div>
          </div>

          {dataLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="font-bold text-muted-foreground">Syncing with Intelligence Hub...</p>
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <div className="bg-card rounded-[3rem] p-24 text-center border-2 border-dashed space-y-4">
              <Check className="h-16 w-16 text-primary/20 mx-auto" />
              <h2 className="text-2xl font-bold">Queue is Clean!</h2>
              <p className="text-muted-foreground">All submissions have been reviewed. Good work, Scout.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {submissions.map((sub: any) => (
                <Card key={sub.id} className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all rounded-[2rem]">
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
                          onClick={() => handleReject(sub.id)}
                          disabled={processingId === sub.id}
                        >
                          {processingId === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                          Reject
                        </Button>
                        <Button 
                          className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-8 font-bold shadow-lg shadow-emerald-600/20"
                          onClick={() => handleApprove(sub)}
                          disabled={processingId === sub.id}
                        >
                          {processingId === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                          Approve Live
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Metadata Analysis</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/50 p-4 rounded-2xl">
                              <p className="text-xs font-bold text-muted-foreground mb-1">Contact</p>
                              <p className="text-sm font-black truncate">{sub.contactEmail}</p>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-2xl">
                              <p className="text-xs font-bold text-muted-foreground mb-1">Website</p>
                              <a href={sub.websiteUrl} target="_blank" className="text-sm font-black text-primary flex items-center gap-1">
                                Visit <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Target Categories</p>
                          <div className="flex flex-wrap gap-2">
                            {sub.professions.map((p: string) => (
                              <Badge key={p} className="bg-primary/10 text-primary border-none">{p}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">SEO Configuration</p>
                          <div className="space-y-2 bg-muted/20 p-4 rounded-2xl border">
                            <p className="text-sm font-bold"><span className="text-muted-foreground font-medium">Title:</span> {sub.seoTitle}</p>
                            <p className="text-sm font-bold"><span className="text-muted-foreground font-medium">Meta:</span> {sub.metaDescription}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Generated Full Report</p>
                        <div className="bg-muted/10 p-6 rounded-2xl border max-h-[300px] overflow-y-auto text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                          {sub.longDescription || "No long description provided."}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
