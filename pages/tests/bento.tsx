import React from "react";
import Layout from "../../components/_Core/Section/Layout";
import { Garden } from "../../components/Content/Planets/GalleryList";


export default function BentoTestPage() {

    function test() {

    }

    return (
        <div className="mt-8">
            <Layout>
                <Garden onClose={test} />
            </Layout>
        </div>
    );
};