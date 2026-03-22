"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getBlogPostBySlug, BLOG_POSTS, BLOG_CATEGORIES } from "@/lib/blog-data";
import { useI18n } from "@/components/providers/I18nProvider";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  const { slug } = use(params);
  const { t } = useI18n();
  const post = getBlogPostBySlug(slug);
  const category = post ? BLOG_CATEGORIES.find(c => c.id === post.category) : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">404</p>
          <h1 className="text-2xl font-bold text-white mb-2">Article Not Found</h1>
          <p className="text-slate-400 mb-6">The article you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/blog" className="text-sky-400 hover:text-sky-300">
            ← {t("common.back")}
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = BLOG_POSTS
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main>
        <section className="relative h-96 overflow-hidden">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-4xl mx-auto">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t("common.back")}
              </Link>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block bg-sky-500 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  {category?.emoji} {t(`blog.categories.${post.category}`)}
                </span>
                
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{post.authorAvatar}</span>
                    <span>{post.author}</span>
                  </div>
                  <span>•</span>
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{post.readTime} {t("blog.readTime")}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.article 
              className="prose prose-invert prose-lg max-w-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xl text-slate-300 mb-8 lead">
                {post.excerpt}
              </p>
              
              <div className="space-y-6 text-slate-300">
                {post.content.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-3xl font-bold text-white mt-8 mb-4">{line.slice(2)}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold text-white mt-6 mb-3">{line.slice(3)}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-bold text-white mt-4 mb-2">{line.slice(4)}</h3>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={index} className="ml-4">{line.slice(2)}</li>;
                  }
                  if (line.trim() === '') {
                    return <br key={index} />;
                  }
                  if (!line.startsWith('|') && !line.startsWith('---')) {
                    return <p key={index}>{line}</p>;
                  }
                  return null;
                })}
              </div>
            </motion.article>

            <div className="mt-12 pt-8 border-t border-slate-800">
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {relatedPosts.length > 0 && (
          <section className="py-12 bg-slate-800/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-white mb-6">{t("blog.latest")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link href={`/blog/${relatedPost.slug}`} className="block group">
                      <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden hover:border-sky-500/50 transition-all">
                        <img 
                          src={relatedPost.coverImage} 
                          alt={relatedPost.title}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-white line-clamp-2 group-hover:text-sky-400 transition-colors">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-2">
                            {relatedPost.readTime} {t("blog.readTime")}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
