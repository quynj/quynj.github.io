<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const profile = {
  name: 'Quynj',
  title: 'Student',
  age: '21',
  intro:
    'CAIJI一个。',
  githubUser: 'quynj',
  repo: 'quynj/quynj.github.io',
  email: 'hi.yunquan@gmail.com',
}

const chips = [
  'Java',
  'JS/TS',
  'Python',
  'Agentic agents/ Workflow agents',
  'Vibe Coding',
  'Photography',
  'Pop Music',
]

const defaultStats = {
  signal: 'Awaiting signal',
}

const particles = ref([])
const githubStats = ref({ ...defaultStats })
const galleryItems = ref([])
const galleryStatus = ref('正在读取 GitHub photos...')
const activeSlide = ref(0)

const discussionAttrs = {
  src: 'https://giscus.app/client.js',
  'data-repo': 'quynj/quynj.github.io',
  'data-repo-id': 'R_kgDOSGrg2Q',
  'data-category': 'General',
  'data-category-id': 'DIC_kwDOSGrg2c4C7Mb-',
  'data-mapping': 'pathname',
  'data-strict': '0',
  'data-reactions-enabled': '1',
  'data-emit-metadata': '0',
  'data-input-position': 'bottom',
  'data-theme': 'transparent_dark',
  'data-lang': 'zh-CN',
  crossorigin: 'anonymous',
  async: 'true',
}

const currentYear = computed(() => new Date().getFullYear())

const giscusBound = computed(() =>
  Boolean(
    discussionAttrs['data-repo'] &&
      discussionAttrs['data-repo-id'] &&
      discussionAttrs['data-category'] &&
      discussionAttrs['data-category-id'],
  ),
)

const statusMeta = computed(() =>
  giscusBound.value
    ? {
        tone: 'is-live',
        label: 'Discussion online',
      }
    : {
        tone: 'is-off',
        label: 'Pending bind',
      },
)

const statCards = computed(() => [
  {
    eyebrow: 'Live signal',
    value: githubStats.value.signal,
    label: 'Recent GitHub activity',
  },
])

const currentSlide = computed(() => galleryItems.value[activeSlide.value] ?? null)
const hasPhotos = computed(() => galleryItems.value.length > 0)

let galleryTimer = null

function createParticles() {
  particles.value = Array.from({ length: 16 }, (_, index) => ({
    id: index,
    size: Number((Math.random() * 2 + 0.8).toFixed(2)),
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: `${Math.random() * 18 + 10}s`,
    delay: `${Math.random() * 5}s`,
  }))
}

function mountGiscus() {
  const container = document.querySelector('#giscus-thread')
  if (!container || container.childElementCount > 0 || !giscusBound.value) {
    return
  }

  const script = document.createElement('script')
  Object.entries(discussionAttrs).forEach(([key, value]) => {
    script.setAttribute(key, value)
  })
  container.appendChild(script)
}

function describeEvent(event) {
  const repoName = event.repo?.name?.split('/')[1] ?? 'repository'
  const typeMap = {
    PushEvent: `Pushed to ${repoName}`,
    CreateEvent: `Created in ${repoName}`,
    PullRequestEvent: `Updated PR in ${repoName}`,
    WatchEvent: `Starred ${repoName}`,
  }
  return typeMap[event.type] ?? `Recent activity in ${repoName}`
}

function formatPhotoTitle(name, index) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim() || `Photo ${index + 1}`
}

function stopGalleryLoop() {
  if (galleryTimer) {
    window.clearInterval(galleryTimer)
    galleryTimer = null
  }
}

function startGalleryLoop() {
  stopGalleryLoop()
  if (galleryItems.value.length <= 1) {
    return
  }

  galleryTimer = window.setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % galleryItems.value.length
  }, 4200)
}

function setSlide(index) {
  activeSlide.value = index
  startGalleryLoop()
}

function moveSlide(direction) {
  if (!galleryItems.value.length) {
    return
  }

  const total = galleryItems.value.length
  activeSlide.value = (activeSlide.value + direction + total) % total
  startGalleryLoop()
}

async function loadGithubStats() {
  try {
    const [userRes, eventRes] = await Promise.all([
      fetch(`https://api.github.com/users/${profile.githubUser}`),
      fetch(`https://api.github.com/users/${profile.githubUser}/events/public?per_page=1`),
    ])

    if (!userRes.ok) {
      throw new Error('Unable to load GitHub profile')
    }

    await userRes.json()
    const events = eventRes.ok ? await eventRes.json() : []

    githubStats.value = {
      signal: events[0] ? describeEvent(events[0]) : 'No recent public event',
    }
  } catch (error) {
    console.error(error)
    githubStats.value = { ...defaultStats }
  }
}

async function loadGallery() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${profile.repo}/contents/photos?ref=main`,
    )

    if (!response.ok) {
      throw new Error('Unable to read photos directory')
    }

    const files = await response.json()
    const imageExtensions = /\.(avif|gif|jpe?g|png|webp)$/i
    const images = Array.isArray(files)
      ? files
          .filter((file) => file.type === 'file' && imageExtensions.test(file.name))
          .map((file, index) => ({
            id: file.sha ?? `${file.name}-${index}`,
            title: formatPhotoTitle(file.name, index),
            src: file.download_url,
          }))
      : []

    galleryItems.value = images
    galleryStatus.value = images.length
      ? `${images.length} 张图片已就绪，正在循环播放`
      : '还没有发现图片，等你把照片放进 `public/photos/` 后这里会自动出现'
    activeSlide.value = 0
    startGalleryLoop()
  } catch (error) {
    console.error(error)
    galleryItems.value = []
    galleryStatus.value = '暂无任何照片'
  }
}

onMounted(() => {
  createParticles()
  mountGiscus()
  loadGithubStats()
  loadGallery()
})

onUnmounted(() => {
  stopGalleryLoop()

  const container = document.querySelector('#giscus-thread')
  if (container) {
    container.innerHTML = ''
  }
})
</script>

<template>
  <div class="page-shell">
    <div class="ambient ambient-a" />
    <div class="ambient ambient-b" />
    <div class="ambient ambient-c" />
    <div class="grain-overlay" />
    <div class="grid-haze" />

    <main class="page-frame">
      <section class="hero-panel">
        <div class="hero-copy">
          <p class="hero-label">Quynj / Signal Deck</p>
          <h1>{{ profile.name }}</h1>
          <p class="hero-meta">{{ profile.title }} · {{ profile.age }}</p>
          <p class="hero-intro">{{ profile.intro }}</p>

          <div class="chip-row">
            <span v-for="chip in chips" :key="chip" class="chip">{{ chip }}</span>
          </div>

          <div class="hero-actions">
            <a class="primary-link" href="https://github.com/quynj" target="_blank" rel="noreferrer">
              Open GitHub
            </a>
            <a class="secondary-link" href="#discussion">Open Forum</a>
          </div>
        </div>

        <div class="hero-visual">
          <div class="avatar-stage">
            <span
              v-for="particle in particles"
              :key="particle.id"
              class="particle"
              :style="{
                width: `${particle.size}rem`,
                height: `${particle.size}rem`,
                top: particle.top,
                left: particle.left,
                animationDuration: particle.duration,
                animationDelay: particle.delay,
              }"
            />

            <div class="avatar-shell">
              <div class="avatar-ring avatar-ring-outer" />
              <div class="avatar-ring avatar-ring-inner" />
              <img
                class="avatar-image"
                :src="`https://github.com/${profile.githubUser}.png`"
                :alt="`${profile.name} avatar`"
              />
            </div>

          </div>
        </div>
      </section>

      <section class="stats-grid">
        <article
          v-for="item in statCards"
          :key="item.label"
          class="metric-card"
          :class="{ wide: item.wide }"
        >
          <span class="metric-eyebrow">{{ item.eyebrow }}</span>
          <span class="metric-value">{{ item.value }}</span>
          <span class="metric-label">{{ item.label }}</span>
        </article>
      </section>

      <section class="gallery-panel">
        <div class="section-heading">
          <div>
            <p class="panel-label">Photo Loop</p>
          </div>
        </div>

        <div class="gallery-layout" :class="{ 'has-photos': hasPhotos }">
          <div class="gallery-stage">
            <div v-if="currentSlide" class="gallery-frame">
              <img
                class="gallery-image"
                :src="currentSlide.src"
                :alt="currentSlide.title"
              />
            </div>

            <div v-else class="gallery-empty">
              <p class="panel-label">Waiting for photos</p>
              <p>{{ galleryStatus }}</p>
            </div>
          </div>

          <aside class="gallery-sidebar">
            <div v-if="hasPhotos" class="thumb-grid">
              <button
                v-for="(item, index) in galleryItems"
                :key="item.id"
                type="button"
                class="thumb-card"
                :class="{ active: index === activeSlide }"
                @click="setSlide(index)"
              >
                <img :src="item.src" :alt="item.title" />
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section class="forum-panel" id="discussion">
        <div class="forum-head">
          <div>
            <p class="panel-label">Forum</p>
            <h2>GitHub Discussion</h2>
          </div>
          <div class="status-pill" :class="statusMeta.tone">
            <span class="status-dot" />
            <span>{{ statusMeta.label }}</span>
          </div>
        </div>

        <div id="giscus-thread" class="giscus-thread" />
      </section>
    </main>

    <footer class="page-footer">
      <span>{{ currentYear }}</span>
      <a :href="`https://github.com/${profile.githubUser}`">GitHub</a>
    </footer>
  </div>
</template>
