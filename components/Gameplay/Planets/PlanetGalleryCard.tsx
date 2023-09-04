import React from "react";
import { Card } from "react-bootstrap";
import Link from "next/link";

interface Props {
  planet: {
    id: string;
    content: string;
    cover: string;
    classification_status: string; // Add classification_status field
    difficulty: string;
  };
}

export default function PlanetGalleryCard({ planet }: Props) {
  const { id, content, cover, classification_status, difficulty } = planet;

  return (
    <div className="col-md-4 mb-4">
      <Card>
        {/* Fixed dimensions wrapper */}
        <div style={{ width: "100%", height: "200px", overflow: "hidden" }}>
          <Card.Img
            variant="top"
            src={cover}
            alt="Planet cover image"
            className="w-100 h-auto"
          />
        </div>
        <Card.Body>
          <Card.Title>{content}</Card.Title>
          {difficulty == "1" && (
            <div className="badge badge-primary badge-outline mx-0.5 ml-1">difficulty: {difficulty} </div>
          )}
          {difficulty == "2" && (
            <div className="badge badge-info  badge-outline mx-0.5 ml-1">difficulty: {difficulty} </div>
          )}
          {difficulty == "3" && (
            <div className="badge badge-accent  badge-outline mx-0.5 ml-1">difficulty: {difficulty} </div>
          )}
          {classification_status == 'unclassified' && (
            <div className="badge badge-neutral badge-outline mx-0.25">{classification_status}</div>
          )}
          {classification_status == 'incomplete' && (
            <div className="badge badge-accent badge-outline mx-0.25">{classification_status}</div>
          )}
          {classification_status == 'in progress' && (
            <div className="badge badge-secondary badge-outline mx-0.25">{classification_status}</div>
          )}
          <Link legacyBehaviorclassName="mx-2 items-end align-items: flex-end" legacyBehavior href={`/tests/planets/${planet.id}`}>
            {/* <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
              <span className="relative px-5 py-0.65 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                explore
              </span>
            </button> */}
            <div className="badge badge-primary mx-1 align-items: flex-end items-end">explore</div>
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
}