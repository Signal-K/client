"use client";
import { computed, makeAutoObservable, configure, action } from 'mobx';
import { useRouter } from 'next/navigation';
import Resizer from "react-image-file-resizer";
import { useSession, useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react';

configure({ enforceActions: "never" });

const CAPTURE_SCHEMA = {
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
};

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  location: number;
}

interface Capture {
  _id?: string;
  object: string;
  image: string;
  species: string;
  approximateWeight: string;
  approximateHeight: string;
  weight: number;
  height: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  type: string;
  description: string;
  voiceJobToken: string;
  voicePath: string;
  voiceStatus: string;
  voiceUrl: string;
}

class AppStore {
  store: any;
  router = useRouter();
  supabase = useSupabaseClient();

  constructor(store: any) {
    makeAutoObservable(this);
    this.store = store;
    this.init();
  }

  profile: UserProfile = {
    id: "",
    username: "Demo",
    full_name: "",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    location: 0,
  };

  leaderboard: any[] = [];

  pokemon: Capture[] = [];

  keyword = "";

  capture: Capture = { ...CAPTURE_SCHEMA };

  picture = {
    buttonPressed: false,
    loadingContent: false,
  };

  async init() {
    try {
      const session = await useSession();
      const supabase = await useSupabaseClient();
      if (!session) {
        return false;
      }
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      if (userData) {
        this.profile = {
          ...userData,
        };
      }
      this.getUser();
      // this.getLeaderboard();
    } catch (error) {
      console.error(error);
    }
  }

  async getUser() {
    try {
      const { data: user } = await fetch('/api/user', {
        cache: 'no-store',
      }).then(res => res.json());
      if (user) {
        this.profile = { ...user };
      }
      this.getPokemon();
    } catch (error) {
      console.error('getUser', error);
    }
  }

  get filteredPokemon() {
    return this.pokemon.filter(poke => {
      return poke.object.toLowerCase().includes(this.keyword.toLowerCase()) || poke.type.toLowerCase().includes(this.keyword.toLowerCase());
    });
  }

  async getPokemon() {
    try {
      const { data } = await fetch('/api/pokemon', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => res.json());

      this.pokemon = data.pokemon;
    } catch (error) {
      console.error('getPokemon', error);
    }
  }

  // async getLeaderboard() {
  //   try {
  //     this.leaderboardRefresh = true;
  //     this.leaderboard = [];
  //     const { data } = await fetch('/api/leaderboard', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     }).then(res => res.json());

  //     this.leaderboard = [...data.leaderboard];
  //     this.leaderboardRefresh = false;
  //   } catch (error) {
  //     console.error('getLeaderboard', error);
  //   }
  // }

  async deletePokemon() {
    try {
      const _id = this.capture._id;
      await fetch('/api/pokemon/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id }),
      });

      this.capture = { ...CAPTURE_SCHEMA };
      await this.getPokemon();
      this.router.push('/pokedex');
    } catch (error) {
      console.error('deletePokemon', error);
    }
  }

  async handleCaptureImage(file: File | any) {
    try {
      this.capture = { ...CAPTURE_SCHEMA };
      if (file.target) {
        file = file.target.files[0];
        file = await new Promise(resolve => {
          Resizer.imageFileResizer(file, 512, 512, 'JPEG', 100, 0, uri => {
            resolve(uri);
          }, 'base64');
        });
      }
      this.capture.image = file;
      this.analysisCapture();
    } catch (error) {
      console.error('handleCaptureImage', error);
    }
  }

  async analysisCapture() {
    try {
      const { data } = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ capture: this.capture }),
      }).then(res => res.json());

      this.capture = {
        ...data.entry,
        image: this.capture.image,
      };

      if (this.capture.description !== 'No object identified.' && this.capture.description !== 'No object detected.') {
        this.pokemon.push(this.capture);
      }
      this.router.push('/pokedex/preview');
      this.picture.buttonPressed = false;
      this.picture.loadingContent = false;
    } catch (error) {
      console.error('analysisCapture', error);
    }
  }

  pollingVoice: any;

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
        inference_job_token: this.capture.voiceJobToken,
        description: this.capture.description,
        voiceUrl: this.capture.voiceUrl,
      },
    };
    try {
      const { data } = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify(bodyData),
      }).then(res => res.json());

      this.capture = {
        ...this.capture,
        ...data.capture,
      };

      const index = this.pokemon.findIndex(poke => poke._id === this.capture._id);
      this.pokemon[index] = { ...this.capture };

      if (this.capture.voiceStatus !== 'complete_success') {
        this.pollingVoice = setTimeout(this.fetchVoice, 5000);
      }
    } catch (error) {
      console.error('fetchVoice', error);
    }
  }

  viewPoke = async (poke: Capture) => {
    this.capture = { ...poke };
    this.router.push('/pokedex/preview/');
  };
}

export default AppStore;
