import React from "react";
import { Card } from "react-bootstrap";
import Link  from "next/link";

interface Props {
  planet: {
    id: string;
    content: string;
    cover: string;
  };
}

export default function PlanetGalleryCard({ planet }: Props) {
  const { id, content, cover } = planet;

  return (
    <div className="col-md-4 mb-4">
      <Card>
        <Card.Img variant="top" src={cover} alt="Planet cover image" />
        <Card.Body>
          <Card.Title>{content}</Card.Title>
          <Link legacyBehavior href={`/tests/planets/${planet.id}`}>
            <a className="btn btn-primary">Explore</a>
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
}