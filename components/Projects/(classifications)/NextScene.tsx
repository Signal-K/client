'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';

type Props = {
  id: string;
};

export default function ClientClassificationPage({ id }: Props) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [classification, setClassification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassification = async () => {
      const { data, error } = await supabase
        .from('classifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching classification:', error);
        return;
      }

      setClassification(data);
      setLoading(false);
    };

    fetchClassification();
  }, [id, supabase]);

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;
  if (!classification) return null;

  const mediaUrl = classification.media?.[1]?.[0];

  return (
    <div className="min-h-screen bg-[#1E1E2E] flex items-center justify-center px-4 py-10">
      <div className="bg-[#2E3440] rounded-2xl shadow-xl p-6 max-w-xl w-full border border-[#3B4252] space-y-6">

        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-white">🪐 Classification Summary</h1>
          <p className="text-sm text-gray-400">ID: {classification.id}</p>
          <p className="text-sm text-gray-500">Created At: {new Date(classification.created_at).toLocaleString()}</p>
        </div>

        {mediaUrl && (
          <div className="relative group rounded-lg overflow-hidden border border-[#4C566A]">
            <Dialog>
              <DialogTrigger asChild>
                <Image
                  src={mediaUrl}
                  alt="Annotated Media"
                  width={600}
                  height={400}
                  className="w-full h-auto cursor-zoom-in transition-transform duration-200 group-hover:scale-105"
                />
              </DialogTrigger>
              <DialogContent className="p-0 bg-transparent shadow-none border-none max-w-4xl">
                <img src={mediaUrl} alt="Full View" className="w-full h-auto rounded-lg" />
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="text-sm text-[#D8DEE9]">
          <p><span className="font-medium text-white">Type:</span> {classification.classificationtype}</p>
          <p><span className="font-medium text-white">Anomaly:</span> {classification.anomaly}</p>
          <p><span className="font-medium text-white">Author ID:</span> {classification.author}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#4C566A]">
          <Button variant="secondary" onClick={() => router.push(`/study/${classification.anomaly}`)}>
            🔍 Continue Studying
          </Button>
          <Button variant="outline" onClick={() => router.push('/structure')}>
            🧬 Back to Structure
          </Button>
          <Button variant="ghost" onClick={() => router.push('/')}>
            🏠 Home
          </Button>
        </div>
      </div>
    </div>
  );
};