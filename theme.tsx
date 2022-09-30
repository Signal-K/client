import type { NextraThemeLayoutProps } from 'nextra';
import CoreLayout from './components/Core/Layout';
import Head from 'next/head';
import Link from 'next/link';

const components = {};

export default function NextraLayout({ children, pageOpts }: NextraThemeLayoutProps ) {
    const { title, frontMatter, headings } = pageOpts;
    const { pageMap } = pageOpts;

    return (
        <CoreLayout>
            {pageMap.map(item => {
                if (item.kind === 'MdxPage') {
                    return (
                        <Link key={item.name} href={item.route}>
                            {item.route}
                        </Link>
                    )
                }
                return null;
            })}
            <ul>
                {headings.map(heading => (
                    <li key={heading.value}>{heading.value}</li>
                ))}
            </ul>
            <div>{children}</div>
        </CoreLayout>
    )
}