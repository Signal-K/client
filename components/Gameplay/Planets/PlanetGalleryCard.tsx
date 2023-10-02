import React from "react";
import { Card } from "react-bootstrap";
import Link from "next/link";

interface Props {
  planet: {
    id: string;
    content: string;
    cover: string;
    classification_status: string; // Add classification_status field
  };
}

export default function PlanetGalleryCard({ planet }: Props) {
  const { id, content, cover, classification_status } = planet;

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
          <Link className="mx-2" legacyBehavior href={`/tests/planets/${planet.id}`}>
            <a className="btn btn-primary">Explore</a>
          </Link>
          {classification_status == 'unclassified' && (
            <div className="badge badge-neutral badge-outline mx-3">{classification_status}</div>
          )}
          {classification_status == 'incomplete' && (
            <div className="badge badge-accent badge-outline mx-3">{classification_status}</div>
          )}
          {classification_status == 'in progress' && (
            <div className="badge badge-secondary badge-outline mx-3">{classification_status}</div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}