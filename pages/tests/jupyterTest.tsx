import Image from 'next/image';
import dynamic from 'next/dynamic';

const NotebookComponentNoSSR = dynamic(
    () => import('../')
)