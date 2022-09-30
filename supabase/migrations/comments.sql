CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    parent_comment_id BIGINT,
    content TEXT NOT NULL,
    author UUID NOT NULL,
    created_at TIMESTAMPZ NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts_duplicate (id),
    FOREIGN KEY (parent_comment_id) REFERENCES comments (id),
    FOREIGN KEY (author) REFERENCES profiles (id),
)