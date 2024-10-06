"use client";

import { computed, makeAutoObservable, configure } from 'mobx';
import { useRouter } from 'next/navigation';
import Resizer from "react-image-file-resizer";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

configure({ enforceActions: "never" });

const CAPTURE_SCHEMA = {
    _id: { $uuid: '' },
    object: "",
    image: "",
    species: "",
    approximateWeight: "",
    approximateHeight: "",
    weight: 0,
    height: 0,
    hp: 0,
    attack: 0,
    defense: 0,
    speed: 0,
    type: "",
    description: "",
    voiceJobToken: "",
    voicePath: "",
    voiceStatus: "",
    voiceUrl: "",
    inference_job_token: "",
};

interface UserProfile {
    name: string;
    email: string;
    avatar: string;
}

interface Pokemon {
    _id: { $uuid: string };
    object: string;
    type: string;
    image: string; 
    description?: string;
    inference_job_token?: string;
    voiceUrl?: string;
    voiceStatus?: string;
    voiceJobToken?: string;
    voicePath?: string;
}

class ZoodexStore {
    session = useSession();
    supabase = useSupabaseClient();
    router = useRouter();
    leaderboard: any[] = [];
    profile: UserProfile = {
        name: "Demo",
        email: "",
        avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    };
    pokemon: Pokemon[] = [];
    keyword: string = "";
    capture: typeof CAPTURE_SCHEMA = { ...CAPTURE_SCHEMA };
    picture: { buttonPressed: boolean; loadingContent: boolean } = {
        buttonPressed: false,
        loadingContent: false,
    };

    constructor() {
        makeAutoObservable(this);
        this.init();
    }

    async init() {
        try {
            const session = await this.session;
            if (!session) {
                return false;
            }
            await this.fetchProfile();
            this.getUser();
            this.getLeaderboard();
        } catch (error) {
            console.error(error);
        }
    }

    async fetchProfile() {
        if (this.session) {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('name, email, avatar')
                .eq('id', this.session.user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return;
            }

            if (data) {
                this.profile = {
                    name: data.name || "Demo",
                    email: data.email || "",
                    avatar: data.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                };
            }
        }
    }

    get filteredPokemon() {
        return this.pokemon.filter(poke => {
            return poke.object.toLowerCase().includes(this.keyword.toLowerCase()) ||
                poke.type.toLowerCase().includes(this.keyword.toLowerCase());
        });
    }

    async getUser() {
        const response = await fetch('/api/user', {
            cache: 'no-store',
        });
        const { user } = await response.json();
        console.log(`getUser`, user);
        if (user) {
            this.profile = { ...user };
        }
        this.getPokemon();
    }

    async getPokemon() {
        const response = await fetch("/api/pokemon", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        this.pokemon = data.pokemon;
    }

    async getLeaderboard() {
        this.leaderboard = [];
        const response = await fetch("/api/leaderboard", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        this.leaderboard = [...data.leaderboard];
    }

    async deletePokemon() {
        const _id = this.capture._id; 
        const response = await fetch("/api/pokemon/delete", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id }),
        });
        const data = await response.json();
        this.capture = { ...CAPTURE_SCHEMA };
        await this.getPokemon();
        this.router.push('/pokedex');
    }

    async handleCaptureImage(file: File | React.ChangeEvent<HTMLInputElement>) {
        this.capture = { ...CAPTURE_SCHEMA };
        if (file instanceof Event) {
            const target = file.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                file = target.files[0]; 
            } else {
                return; 
            }
        }
        const resizedImage = await new Promise<string>((resolve, reject) => {
            Resizer.imageFileResizer(
                file as File,
                512,
                512,
                'JPEG',
                100,
                0,
                (value) => {
                    if (typeof value === "string") {
                        resolve(value); 
                    } else {
                        reject(new Error('Image resizing failed'));
                    }
                },
                'base64'
            );
        });        
        this.capture.image = resizedImage; 
        this.analysisCapture();
    }

    async analysisCapture() {
        const response = await fetch("/api", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ capture: this.capture }),
        });
        const data = await response.json();
        this.capture = {
            ...data.entry,
            image: this.capture.image,
        };
        if (this.capture.description !== "No object identified." && this.capture.description !== "No object detected.") {
            this.pokemon.push(this.capture);
        }
        this.router.push('/pokedex/preview');
        this.picture.buttonPressed = false;
        this.picture.loadingContent = false;
    }

    pollingVoice: NodeJS.Timeout | undefined;

    async fetchVoice() {
        if (!this.capture.description) {
            return false;
        }
        if (this.capture.voiceUrl) {
            return false;
        }
        const bodyData = {
            capture: {
                _id: this.capture._id,
                inference_job_token: this.capture.inference_job_token,
                description: this.capture.description,
                voiceUrl: this.capture.voiceUrl,
            },
        };
        console.log(`00 send to voice api`, bodyData);
        const response = await fetch("/api/voice", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
            body: JSON.stringify(bodyData),
        });
        const data = await response.json();
        this.capture = {
            ...this.capture,
            ...data.capture,
        };
        const index = this.pokemon.findIndex(poke => poke._id.$uuid === this.capture._id.$uuid);
        this.pokemon[index] = { ...this.capture };
        if (this.capture.voiceStatus !== "complete_success") {
            this.pollingVoice = setTimeout(this.fetchVoice.bind(this), 5000);
        }
    }

    async viewPoke(poke: Pokemon) {
        this.capture = {
            ...CAPTURE_SCHEMA,
            image: this.capture.image,
            species: "",
            approximateWeight: "",
            approximateHeight: "",
            weight: 0,
            height: 0,
            hp: 0,
            attack: 0,
            defense: 0,
            speed: 0,
            type: "",
            description: "",
            voiceJobToken: "",
            voicePath: "",
            voiceStatus: "",
            voiceUrl: "",
        };
        
        this.router.push('/pokedex/preview');
        await this.delay(500);
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default ZoodexStore;