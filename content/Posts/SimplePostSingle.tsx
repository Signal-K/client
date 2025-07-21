'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarGenerator } from '@/components/Account/Avatar';
import { Button } from '@/components/ui/button';
import { Share2, ThumbsUpIcon, ThumbsDownIcon, MessageCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { CommentForm } from '../Comments/CommentForm';
import CommentsList from '../Comments/CommentListById';
import { useRouter } from 'next/navigation';

interface SimplePostSingleProps {
  title: string;
  id: string;
  author: string;
  content: string;
  category: string;
  images: string[];
};

export function SimplePostSingle({
  id,
  title,
  author,
  content,
  category,
  images,
}: SimplePostSingleProps) {
  const router = useRouter();

  const supabase = useSupabaseClient();
  const session = useSession();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [voteTotal, setVoteTotal] = useState<number>(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null); 
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVotes();
  }, [id, session?.user?.id]);

  const fetchVotes = async () => {
    try {
      const { data: votes, error } = await supabase
        .from('votes')
        .select('vote_type, user_id')
        .eq('classification_id', id);

      if (error) throw error;

      const upvotes = votes.filter((v) => v.vote_type === 'up').length;
      const downvotes = votes.filter((v) => v.vote_type === 'down').length;

      setVoteTotal(upvotes - downvotes);

      if (session?.user?.id) {
        const userVote = votes.find((v) => v.user_id === session.user.id);
        setUserVote(userVote?.vote_type || null);
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  };

  const handleVote = async (type: 'up' | 'down') => {
    if (!session) return;

    try {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('classification_id', id)
        .maybeSingle();

      if (existingVote) {
        if (existingVote.vote_type === type) {
          await supabase.from('votes').delete().eq('id', existingVote.id);
          setUserVote(null);
        } else {
          await supabase.from('votes').update({ vote_type: type }).eq('id', existingVote.id);
          setUserVote(type);
        }
      } else {
        await supabase.from('votes').insert({
          user_id: session.user.id,
          classification_id: id,
          vote_type: type,
        });
        setUserVote(type);
      }

      fetchVotes();
    } catch (error) {
      console.error('Voting error:', error);
    }
  };

  const goToNextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const goToPreviousImage = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const toggleCommentForm = () => setShowCommentForm((prev) => !prev);

  const handleCopyLink = () => {
    const link = `https://starsailors.space/posts/${id}`;
    navigator.clipboard.writeText(link).then(() => alert('Link copied to clipboard!'));
  };

  const openPostInNewTab = () => window.open(`/posts/${id}`, '_blank');

  const handleShare = async () => {
    if (!shareCardRef.current) return;

    const images = Array.from(shareCardRef.current.querySelectorAll('img'));
    const imagePromises = images.map((img: HTMLImageElement) =>
      new Promise<void>((resolve, reject) => {
        if (img.complete) return resolve();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('image failed to load'));
      })
    );

    await Promise.all(imagePromises);

    const canvas = await html2canvas(shareCardRef.current, {
      useCORS: true,
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-share.png`;
        link.click();
      }
    }, 'image/png');
  };

  return (
    <div className="flex items-center justify-center w-full px-4 overflow-hidden" ref={shareCardRef}>
      <Card className="w-full max-w-4xl md:w-4/5 max-h-screen bg-white border border-[#D8DEE9] shadow-2xl rounded-xl overflow-y-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <AvatarGenerator author={author} />
            <div>
              <CardTitle className="text-[#2E3440]">{title}</CardTitle>
              <p className="text-sm text-[#4C566A]">by {author}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-xs font-semibold text-[#5E81AC] uppercase mb-1 tracking-wide">{category}</p>
          <p className="text-[#2E3440]">{content}</p>

          {images.length > 0 && (
            <div className="relative">
              <img
                src={images[currentIndex]}
                alt={`Image ${currentIndex + 1}`}
                className="w-full max-h-[400px] object-contain cursor-pointer rounded-lg transition-all duration-200" // 🔧 UPDATED
                onClick={() => setIsLightboxOpen(true)}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousImage}
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-[#4C566A]/60 text-white rounded-full p-2"
                  >
                    &#8592;
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-[#4C566A]/60 text-white rounded-full p-2"
                  >
                    &#8594;
                  </button>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 w-2 rounded-full transition ${
                          currentIndex === index ? 'bg-[#5E81AC]' : 'bg-[#D8DEE9]'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {isLightboxOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
              <button
                className="absolute top-4 right-4 text-white text-2xl"
                onClick={() => setIsLightboxOpen(false)}
              >
                ✕
              </button>
              <img
                src={images[currentIndex]}
                alt={`Enlarged image ${currentIndex + 1}`}
                className="max-w-[90%] max-h-[40%] object-contain rounded-lg"
              />
            </div>
          )}

          <div className="w-full flex justify-between items-center px-0 pb-2 pt-2 border-t border-[#D8DEE9] text-[#2E3440] text-sm bg-white/80">
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleVote('up')}
                className={`flex items-center gap-1 transition ${
                  userVote === 'up' ? 'text-[#A3BE8C]' : 'text-[#4C566A] hover:text-[#88C0D0]'
                }`}
              >
                <ThumbsUpIcon className="w-5 h-5" />
                Upvote
              </button>
              <button
                onClick={() => handleVote('down')}
                className={`flex items-center gap-1 transition ${
                  userVote === 'down' ? 'text-[#BF616A]' : 'text-[#4C566A] hover:text-[#D08770]'
                }`}
              >
                <ThumbsDownIcon className="w-5 h-5" />
                Downvote
              </button>
              <div className="text-sm font-semibold text-[#2E3440]">
                Score:{' '}
                <span className={voteTotal >= 0 ? 'text-green-600' : 'text-red-600'}>{voteTotal}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleCommentForm}
                className="flex items-center gap-1 text-[#4C566A] hover:text-[#A3BE8C] transition"
              >
                <MessageCircle className="w-5 h-5" />
                Comment
              </button>
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-1 text-[#4C566A] hover:text-[#EBCB8B] transition"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
                {dropdownOpen && (
                  <div className="absolute bottom-10 right-0 bg-white/90 backdrop-blur-md border border-[#D8DEE9] shadow-xl rounded-lg p-4 z-20">
                    <Button onClick={handleCopyLink} className="w-full mb-2 bg-[#88C0D0] text-white hover:bg-[#81A1C1]">
                      Copy Link
                    </Button>
                    <Button onClick={openPostInNewTab} className="w-full mb-2 bg-[#5E81AC] text-white hover:bg-[#4C566A]">
                      Open
                    </Button>
                    <Button onClick={handleShare} className="w-full bg-[#A3BE8C] text-white hover:bg-[#8FBC8F]">
                      Download Post
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

                <Button
                  onClick={() => router.push(`/next/${id}`)}
                  variant='outline'
                >
                  Details
                </Button>

          <CommentForm classificationId={parseInt(id)} onSubmit={() => setShowCommentForm(false)} />
          <CommentsList classificationId={id} />
        </CardContent>
      </Card>
    </div>
  );
};