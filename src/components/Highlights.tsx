"use client";

import { Component, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { EmbeddedTweet, TweetSkeleton, useTweet } from "react-tweet";
import type { Tweet } from "react-tweet/api";

const INITIAL_COUNT = 4;

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

/**
 * Curated tweets from MonadBlitz events around the world.
 *
 * HOW TO ADD TWEETS:
 * 1. Find a tweet URL like https://x.com/monad/status/2028534499458404671
 * 2. Extract the numeric ID at the end
 * 3. Add it below with a label
 */
const HIGHLIGHT_TWEETS = [
  { id: "2064370221058568234", label: "Recap Monad Blitz Medellín" },
  { id: "2064481863033311374", label: "Ganadores Medellín" },
  { id: "2064104613020582172", label: "Equipos Medellín" },
  { id: "2064056162417303775", label: "Mentores y staff Medellín" },
  { id: "2049177585527951710", label: "Monad Blitz México" },
  { id: "2028534499458404671", label: "Monad Blitz Denver" },
  { id: "1972727436501807574", label: "Monad Blitz Bangkok" },
];

export default function Highlights() {
  const [showAll, setShowAll] = useState(false);
  const visibleTweets = showAll ? HIGHLIGHT_TWEETS : HIGHLIGHT_TWEETS.slice(0, INITIAL_COUNT);

  return (
    <section id="highlights" className="py-16 sm:py-20 px-6 bg-monad-dark overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
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
            Recap, ganadores y equipos del 6 de junio, publicados por @MedellinBlock. El botón de
            abajo abre Blitz de otras ciudades.
          </p>
        </motion.div>

        {/* Tweet grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTweets.map((tweet, i) => (
            <motion.div
              key={tweet.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASING }}
              className="tweet-card [&_.react-tweet-theme]:!bg-transparent [&_article]:!border-white/10 [&_article]:!rounded-xl"
            >
              <HighlightTweet id={tweet.id} />
            </motion.div>
          ))}
        </div>

        {!showAll && HIGHLIGHT_TWEETS.length > INITIAL_COUNT && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll(true)}
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
