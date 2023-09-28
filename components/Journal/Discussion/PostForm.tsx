import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import getCategories from '../../../utils/discussion/getCategories';
import isProfileExists from '../../../utils/discussion/isProfileExists';
import { supabase } from '../../../utils/discussion/supabaseClient';
import Layout from './Layout';
import { useSession } from '@supabase/auth-helpers-react';

type FormData = {
  title: string;
  body: string;
  tag: string;
};

type FormProps = {
  slug?: string | string[];
};

export default function Form({ slug }: FormProps) {
  const [post, setPost] = useState<any>(null);
  const { handleSubmit, register, setValue, formState: { errors } } = useForm<FormData>();
  const categories = getCategories();
  const session = useSession();

  useEffect(() => {
    (async () => {
      if (session == null) {
        window.location.href = '/login';
      }

      const profileExists = await isProfileExists();
      if (!profileExists) {
        alert('Create username first');
        window.location.href = '/login';
      }
    })();
  }, [session]);

  useEffect(() => {
    if (slug != undefined) {
      (async () => {
        const { data: fetchedPost, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          throw error;
        }

        if (fetchedPost) {
          setPost(fetchedPost);
          setValue('title', fetchedPost.title);
          setValue('body', fetchedPost.body);
          setValue('tag', fetchedPost.tag);
        }
      })();
    }
  }, [slug, setValue]);

  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    let method = 'POST';
    let api_endpoint = '/api/posts/create';

    formData['access_token'] = session.access_token;

    if (post) {
      method = 'PUT';
      api_endpoint = '/api/posts/update';
      formData['slug'] = slug;
    }

    try {
      const response = await fetch(api_endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      window.location.href = `/posts/${data.slug}`;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Post discuss</title>
      </Head>

      <h1 className='is-size-3 mb-2'>Create/Edit Post</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='fields mb-4'>
          <label className='label'>Title</label>
          <input
            className='input'
            type="text"
            placeholder="your post title"
            defaultValue={post != null ? post.title : ''}
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 10, message: 'minimal 10 characters' },
            })}
          />
          {errors.title && (
            <span role="alert" className="has-text-danger">
              {errors.title.message}
            </span>
          )}
        </div>

        <div className='fields mb-4'>
          <label className='label'>Subject</label>
          <textarea
            className='textarea'
            placeholder="I'm going to ask about ..."
            defaultValue={post != null ? post.body : ''}
            {...register('body', {
              required: 'Subject is required',
              minLength: { value: 20, message: 'minimal 20 characters' },
            })}
          >
          </textarea>
          {errors.body && (
            <span role="alert" className="has-text-danger">
              {errors.body.message}
            </span>
          )}
        </div>

        <div className='fields mb-4'>
          <label className='label'>Category</label>
          <div className='select'>
            <select {...register('tag', { required: 'Subject is required' })}>
              {categories.map((cat, index) => (
                <option key={index} value={cat.key}>{cat.name} - {cat.desc} </option>
              ))}
            </select>
          </div>
          {errors.tag && (
            <span role="alert" className="has-text-danger">
              {errors.tag.message}
            </span>
          )}
        </div>

        <div className="submit mt-5">
          <button type="submit" className="button is-fullwidth is-primary">
            {post != null ? 'Update' : 'Submit'}
          </button>
        </div>
      </form>
    </Layout>
  );
}