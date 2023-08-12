import { useState, useEffect, ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../../../utils/discussion/supabaseClient';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const session = useSession();
  const [isActive, setIsActive] = useState(false);

  return (
    <>
      <Head>
        <title>Discuss-OS Supabase</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav
        className="navbar has-background-light mb-5 py-3"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="container is-max-desktop">
          <div className="navbar-brand">
            <Link href="/">
              <a className="navbar-item">
                <svg
                  width="50"
                  height="39"
                  viewBox="0 0 50 39"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* ... (SVG content) ... */}
                </svg>

                <h1 className="is-size-5 ml-1">Discussbase</h1>
              </a>
            </Link>

            <a
              onClick={() => {
                setIsActive(!isActive);
              }}
              role="button"
              className={`navbar-burger burger ${
                isActive ? 'is-active' : ''
              }`}
              aria-label="menu"
              aria-expanded="false"
              data-target="navbarTarget"
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>

          <div
            id="navbarTarget"
            className={`navbar-menu ${isActive ? 'is-active' : ''}`}
          >
            <div className="navbar-end">
              <Link href="/posts">
                <a className={'navbar-item'}>Forum</a>
              </Link>

              {session ? (
                <>
                  <Link href="/posts/create">
                    <a className={'navbar-item'}>New+</a>
                  </Link>
                  <Link href="/profile">
                    <a className="navbar-item">Profile</a>
                  </Link>
                  <a
                    className="navbar-item"
                    onClick={() => {
                      supabase.auth.signOut();
                      router.push('/');
                    }}
                  >
                    Log Out
                  </a>
                </>
              ) : (
                <Link href="/login">
                  <a className={'navbar-item'}>Login</a>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="container is-fluid">
          <div className="container is-max-desktop">{children}</div>
        </div>
      </main>
    </>
  );
}