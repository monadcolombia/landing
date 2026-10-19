"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { EmbeddedTweet, TweetSkeleton, useTweet } from "react-tweet";
import type { Tweet } from "react-tweet/api";
import EditionTabs from "./EditionTabs";
import { DEFAULT_EDITION, editionInfo, type EditionKey } from "@/lib/editions";

const EASING = [0.16, 1, 0.3, 1] as const;

// Syndication omits empty entity lists. react-tweet's enrichTweet iterates them
// and throws, which takes down the whole page because nothing catches it.
function entityLists(entities: Tweet["entities"] | undefined): Tweet["entities"] {
  return {
    hashtags: entities?.hashtags ?? [],
    urls: entities?.urls ?? [],
    user_mentions: entities?.user_mentions ?? [],
    symbols: entities?.symbols ?? [],
    media: entities?.media,
  };
}

function withEntityArrays(tweet: Tweet): Tweet {
  return {
    ...tweet,
    entities: entityLists(tweet.entities),
    quoted_tweet: tweet.quoted_tweet
      ? { ...tweet.quoted_tweet, entities: entityLists(tweet.quoted_tweet.entities) }
      : undefined,
  };
}

class TweetBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function tweetFallback(id: string) {
  return (
    <a
      href={`https://x.com/i/status/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-40 items-center justify-center rounded-xl border border-white/10 px-4 text-sm text-white/60 hover:text-white"
    >
      Ver en X
    </a>
  );
}

function HighlightTweet({ id }: { id: string }) {
  const { data, error, isLoading } = useTweet(id);
  if (isLoading) return <TweetSkeleton />;
  if (error || !data) return tweetFallback(id);
  return (
    <TweetBoundary fallback={tweetFallback(id)}>
      <EmbeddedTweet tweet={withEntityArrays(data)} />
    </TweetBoundary>
  );
}

type Post = { id: string; url: string; label: string | null; tweetId: string | null };

// Blitz in other cities, for reference. Each Medellín edition's posts live in the
// database and are managed in /admin/contenido.
const OTHER_CITIES = [
  { id: "2049177585527951710", label: "Monad Blitz México" },
  { id: "2028534499458404671", label: "Monad Blitz Denver" },
  { id: "1972727436501807574", label: "Monad Blitz Bangkok" },
];

function PostCard({ post }: { post: Post }) {
  if (post.tweetId) return <HighlightTweet id={post.tweetId} />;
  let host = post.url;
  try {
    host = new URL(post.url).hostname.replace(/^www\./, "");
  } catch {
    // keep the raw url
  }
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-40 flex-col justify-center gap-2 rounded-xl border border-white/10 px-5 py-6 hover:border-monad-primary/60"
    >
      <span className="text-[10px] font-mono uppercase tracking-[2px] text-white/40">{host}</span>
      <span className="text-white">{post.label || "Ver publicación"} ↗</span>
    </a>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>;
}

function Cell({ index, children }: { index: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.08, ease: EASING }}
      data-theme="dark"
      className="tweet-card [&_.react-tweet-theme]:!bg-transparent [&_article]:!border-white/10 [&_article]:!rounded-xl"
    >
      {children}
    </motion.div>
  );
}

export default function Highlights() {
  const [edition, setEdition] = useState<EditionKey>(DEFAULT_EDITION);
  const [byEdition, setByEdition] = useState<Partial<Record<EditionKey, Post[]>>>({});
  const [showOthers, setShowOthers] = useState(false);
  const posts = byEdition[edition] ?? [];
  const loaded = edition in byEdition;

  useEffect(() => {
    if (loaded) return;
    fetch(`/api/posts?edition=${edition}`)
      .then((r) => r.json())
      .then((j) => setByEdition((m) => ({ ...m, [edition]: j.data || [] })))
      .catch(() => setByEdition((m) => ({ ...m, [edition]: [] })));
  }, [edition, loaded]);

  return (
    <section id="highlights" className="py-16 sm:py-20 px-6 bg-monad-dark overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASING }}
          className="mb-12"
        >
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-white/40 mb-4">
            {"// HIGHLIGHTS"}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white max-w-3xl">
            Lo que pasó en Medellín
          </h2>
          <p className="text-base sm:text-lg text-white/50 mt-4 max-w-xl leading-relaxed">
            Recap, ganadores y equipos del {editionInfo(edition).date}, publicados por
            @MedellinBlock y los equipos.
          </p>
          <div className="mt-6">
            <EditionTabs value={edition} onChange={setEdition} theme="dark" />
          </div>
        </motion.div>

        {loaded && posts.length === 0 && (
          <p className="text-white/50">Pronto publicamos los posts de esta edición.</p>
        )}
        <Grid>
          {posts.map((p, i) => (
            <Cell key={p.id} index={i}>
              <PostCard post={p} />
            </Cell>
          ))}
        </Grid>

        {showOthers ? (
          <div className="mt-14">
            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-white/40 mb-6">
              {"// BLITZ DE OTRAS CIUDADES"}
            </p>
            <Grid>
              {OTHER_CITIES.map((t, i) => (
                <Cell key={t.id} index={i}>
                  <HighlightTweet id={t.id} />
                </Cell>
              ))}
            </Grid>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowOthers(true)}
              className="px-8 py-3 border border-white/20 text-white/70 rounded-full font-mono text-sm uppercase tracking-wide hover:bg-white/5 hover:text-white transition-all"
            >
              Blitz de otras ciudades
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
