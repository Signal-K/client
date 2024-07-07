"use client"

import { useEffect, useState } from "react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useProfileContext } from "@/context/UserProfile";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { $getRoot, $getSelection } from 'lexical';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import ToolbarPlugin from "@/ui/Content/ToolbarPlugin";
import TreeViewPlugin from "@/ui/Content/TreeViewPlugin";
import ExampleTheme from "@/ui/Content/ExampleTheme";
import { $generateHtmlFromNodes } from '@lexical/html';
import { useUserAnomalies } from "@/context/UserAnomalies";
import { useRefresh } from "@/context/RefreshState";

export default function CreateBaseClassification(assetMentioned: any) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [content, setContent] = useState<string>("");
    const [uploads, setUploads] = useState<string[]>([]);

    const { activePlanet } = useActivePlanet();
    const { userProfile } = useProfileContext(); 

    const [isUploading, setIsUploading] = useState(false);

    // const { userAnomalies, fetchUserAnomalies } = useUserAnomalies();
    const [userAnomalies, setUserAnomalies] = useState<number[]>([]);

    useEffect(() => {
        const fetchUserAnomalies = async () => {
            if (!session) return;

            try {
                const { data, error } = await supabase
                    .from('user_anomalies')
                    .select('anomaly_id')
                    .eq('user_id', session.user.id);

                if (error) throw error;

                setUserAnomalies(data.map((anomaly: any) => anomaly.anomaly_id));
            } catch (error: any) {
                console.error("Error fetching user anomalies: ", error.message);
            }
        };

        fetchUserAnomalies();
    }, [session]);

    const newAnomalyData = {
        user_id: session?.user?.id,
        anomaly_id: activePlanet?.id,
    };

    async function createPost() {
        if (!activePlanet?.id) {
            console.error("Active planet ID is undefined");
            return;
        }

        const editorState = $getRoot() //.serializeToJSON();
        // const content = $generateHtmlFromNodes(editorState);

        const { data: classification, error } = await supabase
            .from("classifications")
            .insert({
                author: session?.user?.id,
                content,
                media: uploads,
                anomaly: activePlanet.id,
            })
            .single();

        if (error) {
            console.error("Error creating classification: ", error.message);
            return;
        };

        supabase.from("user_anomalies").insert([newAnomalyData]);

        // if (!userAnomalies.includes(activePlanet.id)) {
        //     const { error: userAnomalyError } = await supabase
        //         .from("user_anomalies")
        //         .insert({
        //             user_id: session?.user?.id,
        //             anomaly_id: activePlanet.id,
        //             ownership_date: new Date().toISOString(),
        //         });

        //     if (userAnomalyError) {
        //         console.error("Error adding user anomaly: ", userAnomalyError.message);
        //         return;
        //     }
        // }

        alert(`Post created`);
        setContent('');
    };

    async function addMedia(e: any) {
        const files = e.target.files;
        if (files.length > 0 && session) {
            setIsUploading(true);
            for (const file of files) {
                const fileName = Date.now() + session.user.id + file.name;
                const result = await supabase.storage
                    .from("media")
                    .upload(fileName, file);

                if (result.data) {
                    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/media' + result.data.path;
                    setUploads(prevUploads => [...prevUploads, url]);
                } else {
                    console.log(result);
                };
            };
            setIsUploading(false);
        };
    };

    return (
        <div className="w-5/6 mx-auto">
            <div className="flex gap-2 mx-5 mt-5 pb-3">
                <div>
                    <img src={userProfile?.avatar_url} width='60px' height='60px' />
                </div>
                <div className="grow p-3 rounded-xl bg-gray-100">
                    <Editor content={content} setContent={setContent} />
                </div>
            </div>
            {isUploading && (
                <div className="text-center">
                    <p>Uploading...</p>
                </div>
            )}
            <div className="flex gap-2 mt-4">
                {uploads.map(upload => (
                    <div key={upload} className="w-auto h-48">
                        <img src={upload} className="w-auto h-48 rounded-md" />
                    </div>
                ))}
            </div>
            <div className="text-center mt-4">
                <label className="flex gap-1 items-center cursor-pointer">
                    <input type="file" className="hidden" onChange={addMedia} />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                    <span className="hidden md:block">Media</span>
                </label>
                <button onClick={createPost} className="text-black px-2 py-1 rounded-md bg-blue-500 hover:bg-blue-600">Share</button>
            </div>
        </div>
    );
};

export function CreateCloudClassification(assetMentioned: any) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { userProfile } = useProfileContext();

    const [content, setContent] = useState<string>("");
    const [uploads, setUploads] = useState<string[]>([]);

    const [isUploading, setIsUploading] = useState(false);

    const [userAnomalies, setUserAnomalies] = useState<number[]>([]);

    useEffect(() => {
        const fetchUserAnomalies = async () => {
            if (!session) return;

            try {
                const { data, error } = await supabase
                    .from('user_anomalies')
                    .select('anomaly_id')
                    .eq('user_id', session.user.id);

                if (error) throw error;

                setUserAnomalies(data.map((anomaly: any) => anomaly.anomaly_id));
            } catch (error: any) {
                console.error("Error fetching user anomalies: ", error.message);
            };
        };

        fetchUserAnomalies();
    }, [session]);

    const newAnomalyData = {
        user_id: session?.user?.id,
        anomaly_id: 1, // ########
    };

    async function createPost() {
        if (!session) {
            return;
        };

        const editorState = $getRoot() //.serializeToJSON();

        const { data: classification, error } = await supabase
            .from("classifications")
            .insert({
                author: session?.user?.id,
                content,
                media: uploads,
                anomaly: 1,
                // anomaly: activePlanet // ########
            })
            .single();

        if (error) {
            return;
        };

        supabase.from("user_anomalies").insert([newAnomalyData]);
        alert(`Post created`);
        setContent('');
    };

    async function addMedia(e: any) {
        const files = e.target.files;
        if (files.length > 0 && session) {
            setIsUploading(true);
            for (const file of files) {
                const fileName = Date.now() + session.user.id + file.name;
                const result = await supabase.storage
                    .from("media")
                    .upload(fileName, file);

                if (result.data) {
                    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/media' + result.data.path;
                    setUploads(prevUploads => [...prevUploads, url]);
                } else {
                    console.log(result);
                };
            };
            setIsUploading(false);
        };
    };

    return (
        <>
            <div className="flex gap-2">
                <img src={userProfile?.avatar_url} width='60px' height='60px' />
            </div>
            <textarea 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                className="grow p-3 h-24 rounded-xl" 
                placeholder={"What do you think about this anomaly/planet"} 
            />
            {isUploading && (
                <div className="text-center">
                    <p>Uploading...</p>
                </div>
            )}
            {uploads.length > 0 && (
                <div className="flex gap-2 mt-4">
                    {uploads.map((upload, index) => (
                        <div key={index} className="">
                            <img src={upload} className="w-auto h-48 rounded-md" alt={`Upload ${index}`} />
                        </div>
                    ))}
                </div>
            )}
            <button 
                onClick={createPost} 
                className="text-black px-2 py-1 rounded-md bg-blue-500 hover:bg-blue-600"
            >
                Share
            </button>
        </>
    );
};

interface ClassificationOption {
  id: number;
  text: string;
}


interface ClassificationOption {
  id: number;
  text: string;
}

const classificationOptions: ClassificationOption[] = [
  { id: 1, text: 'No dips at all' },
  { id: 2, text: 'Repeating dips' },
  { id: 3, text: 'Dips with similar size' },
  { id: 4, text: 'Dips aligned to one side' },
];

export function CreateFirstBaseClassification({ assetMentioned }: { assetMentioned: any }) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [content, setContent] = useState<string>("");
  const [uploads, setUploads] = useState<string[]>([]);
  const { activePlanet } = useActivePlanet();
  const { userProfile } = useProfileContext();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: boolean }>({});
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    console.log("Don't you feel", userProfile);
  }, [session]);

  const handleOptionClick = (optionId: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  const createPost = async () => {
    const classificationConfiguration = Object.fromEntries(
      Object.entries(selectedOptions).map(([key, value]) => [classificationOptions.find(option => option.id === parseInt(key))?.text || '', value])
    );

    const { error } = await supabase
      .from("classifications")
      .insert({
        author: session?.user?.id,
        content,
        media: [uploads, assetMentioned],
        anomaly: activePlanet?.id,
        classificationtype: 'lightcurve',
        classificationConfiguration,
      });

    if (error) {
      console.error("Error creating classification:", error.message);
      alert("Failed to create classification. Please try again.");
    } else {
      alert(`Post created`);
      setContent('');
      setSelectedOptions({});
      setUploads([]);
    }

    await handleMissionComplete();
  };

  const missionData = {
    user: session?.user?.id,
    time_of_completion: new Date().toISOString(),
    mission: 8,
    configuration: null,
    rewarded_items: [13, 13, 13, 16],
  };

  const inventoryData = missionData.rewarded_items.map(item => ({
    item,
    owner: session?.user?.id,
    quantity: 1,
    notes: "Created upon the completion of mission 8",
    parentItem: null,
    time_of_deploy: new Date().toISOString(),
    anomaly: activePlanet?.id,
  }));

  const newAnomalyData = {
    user_id: session?.user?.id,
    anomaly_id: activePlanet?.id,
  };

  const handleMissionComplete = async () => {
    try {
      await supabase.from("missions").insert([missionData]);

      await supabase.from("user_anomalies").insert([newAnomalyData]);

      await supabase.from("inventory").insert(inventoryData);

      useRefresh();
    } catch (error: any) {
      console.error(error);
    }
  };

  const addMedia = async (e: any) => {
    const files = e.target.files;
    if (files.length > 0 && session) {
      setIsUploading(true);
      for (const file of files) {
        const fileName = Date.now() + session.user.id + file.name;
        const { data, error } = await supabase.storage.from("media").upload(fileName, file);

        if (error) {
          console.error('Error uploading file:', error.message);
        } else {
          const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${data.path}`;
          setUploads(prevUploads => [...prevUploads, url]);
        }
      }
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-2">What do you see in this graph?</h2>
      <div className="flex flex-col gap-2 mb-4">
        {classificationOptions.map(option => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className={`p-2 rounded-md ${selectedOptions[option.id] ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {option.text}
          </button>
        ))}
      </div>
      {Object.keys(selectedOptions).length > 0 && (
        <>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="grow p-3 h-24 rounded-xl mb-4"
            placeholder={"What do you think about this anomaly/planet"}
          />
          <label className="flex gap-1 items-center cursor-pointer mb-4">
            <input type="file" className="hidden" onChange={addMedia} />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
            <span className="hidden md:block">Media</span>
          </label>
          {isUploading && (
            <div className="text-center mb-4">
              <p>Uploading...</p>
            </div>
          )}
          {uploads.length > 0 && (
            <div className="flex gap-2 mb-4">
              {uploads.map((upload, index) => (
                <div key={index} className="">
                  <img src={upload} className="w-auto h-48 rounded-md" alt={`Upload ${index}`} />
                </div>
              ))}
            </div>
          )}
          <button
            onClick={createPost}
            className="text-black px-2 py-1 rounded-md bg-blue-500 hover:bg-blue-600"
          >
            Share
          </button>
        </>
      )}
    </div>
  );
}



export function CreateFirstMeteorologyClassification(assetMentioned: any) { // FIRST MISSION GROUP COMPONENT
    const supabase = useSupabaseClient();
    const session = useSession();
    const [content, setContent] = useState<string>("");
    const [uploads, setUploads] = useState<string[]>([]);
    const { activePlanet } = useActivePlanet();
    const { userProfile } = useProfileContext(); 
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        console.log("Don't you feel", userProfile);
    }, [session]);

    async function createPost() {
        // const editorState = $getRoot() //.serializeToJSON();
        // const content = $generateHtmlFromNodes(editorState);

        supabase
            .from("classifications")
            .insert({
                author: session?.user?.id,
                content,
                media: [uploads, assetMentioned],
                anomaly: activePlanet?.id,
            }).then(response => {
                if (!response.error) {
                    alert(`Post created`);
                    setContent('');
                };
            });

        handleMissionComplete();
    };

    const missionData = {
        user: session?.user?.id,
        time_of_completion: new Date().toISOString(),
        mission: 13,
        configuration: null,
        rewarded_items: [1],
    };

    const newAnomalyData = {
        user_id: session?.user?.id,
        anomaly_id: activePlanet?.id,
    };

    const handleMissionComplete = async () => {
        try {
            const { data: newMission, error: newMissionError } = await supabase
                .from("missions")
                .insert([missionData]);

            const { data: newAnomaly, error: newAnomalyError } = await supabase
                .from("user_anomalies")
                .insert([newAnomalyData]);
        } catch (error: any) {
            console.error(error);
        };
    };

    async function addMedia(e: any) {
        const files = e.target.files;
        if (files.length > 0 && session) {
            setIsUploading(true);
            for (const file of files) {
                const fileName = Date.now() + session.user.id + file.name;
                const result = await supabase.storage
                    .from("media")
                    .upload(fileName, file);

                if (result.data) {
                    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/media' + result.data.path;
                    setUploads(prevUploads => [...prevUploads, url]);
                } else {
                    console.log(result);
                };
            };
            setIsUploading(false);
        };
    };

    return (
        <>
            <div className="flex gap-2">
                <img src={userProfile?.avatar_url} width='60px' height='60px' />
            </div>
            <textarea 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                className="grow p-3 h-24 rounded-xl" 
                placeholder={"What do you think about this anomaly/planet"} 
            />
            {isUploading && (
                <div className="text-center">
                    <p>Uploading...</p>
                </div>
            )}
            {uploads.length > 0 && (
                <div className="flex gap-2 mt-4">
                    {uploads.map((upload, index) => (
                        <div key={index} className="">
                            <img src={upload} className="w-auto h-48 rounded-md" alt={`Upload ${index}`} />
                        </div>
                    ))}
                </div>
            )}
            <button 
                onClick={createPost} 
                className="text-black px-2 py-1 rounded-md bg-blue-500 hover:bg-blue-600"
            >
                Share
            </button>
        </>
    );
};

const theme = ExampleTheme;

function onError(error: any) {
  console.error(error);
};

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
};

export function Editor({ content, setContent }: { content: string, setContent: (content: string) => void }) {
  const initialConfig = {
    namespace: 'React.js Demo',
    theme,
    onError,
    nodes: [],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <TreeViewPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
};

export function TellUsWhatYouThinkClassification(assetMentioned: any) { // FIRST MISSION GROUP COMPONENT
    const supabase = useSupabaseClient();
    const session = useSession();

    const [content, setContent] = useState<string>("");
    const { activePlanet } = useActivePlanet();
    const { userProfile } = useProfileContext();

    async function createPost() {
        supabase
            .from("classifications")
            .insert({
                author: session?.user?.id,
                content,
                anomaly: activePlanet?.id,
            }).then(response => {
                if (!response.error) {
                    alert(`Post created, come back soon!`);
                    setContent('');
                };
            });
    }

    return (
        <>
            {/* <div className="flex gap-2">
                <img src={userProfile?.avatar_url} width='60px' height='60px' />
            </div> */}
            <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="grow p-3 h-24 rounded-xl bg-white text-black" // Tailwind classes for background and text color
                placeholder={"Tell us what you think"}  //  - we're constantly adding new content and gameplay, so please come back soon. We're excited to hear what you think
            />
            <button
                onClick={createPost}
                className="text-white px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600"
            >
                Share
            </button>
        </>
    );
}
