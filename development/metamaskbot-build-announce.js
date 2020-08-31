#!/usr/bin/env node
const { promises: fs } = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const VERSION = require('../dist/chrome/manifest.json').version // eslint-disable-line import/no-unresolved

start().catch(console.error)

function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

async function start () {
  const CIRCLE_PROJECT_USERNAME = process.env.CIRCLE_PROJECT_USERNAME
  const CIRCLE_PROJECT_REPONAME = process.env.CIRCLE_PROJECT_REPONAME
  const GITHUB_COMMENT_TOKEN = process.env.GITHUB_COMMENT_TOKEN
  const CIRCLE_PULL_REQUEST = process.env.CIRCLE_PULL_REQUEST
  console.log('CIRCLE_PULL_REQUEST', CIRCLE_PULL_REQUEST)
  const CIRCLE_SHA1 = process.env.CIRCLE_SHA1
  console.log('CIRCLE_SHA1', CIRCLE_SHA1)
  const CIRCLE_BUILD_NUM = process.env.CIRCLE_BUILD_NUM
  console.log('CIRCLE_BUILD_NUM', CIRCLE_BUILD_NUM)

  if (!CIRCLE_PULL_REQUEST) {
    console.warn(`No pull request detected for commit "${CIRCLE_SHA1}"`)
    return
  }

  const CIRCLE_PR_NUMBER = CIRCLE_PULL_REQUEST.split('/').pop()
  const SHORT_SHA1 = CIRCLE_SHA1.slice(0, 7)
  const BUILD_LINK_BASE = `https://${CIRCLE_BUILD_NUM}-228328387-gh.circle-artifacts.com/0`

  // build the github comment content

  // links to extension builds
  const platforms = ['chrome', 'firefox', 'opera']
  const buildLinks = platforms
    .map((platform) => {
      const url = `${BUILD_LINK_BASE}/builds/conflux-portal-${platform}-${VERSION}.zip`
      return `<a href="${url}">${platform}</a>`
    })
    .join(', ')

  // links to bundle browser builds
  const bundles = [
    'background',
    'ui',
    'portal-inpage',
    'portal-contentscript',
    'ui-libs',
    'bg-libs',
    'phishing-detect',
  ]
  const bundleLinks = bundles
    .map((bundle) => {
      const url = `${BUILD_LINK_BASE}/build-artifacts/source-map-explorer/${bundle}.html`
      return `<a href="${url}">${bundle}</a>`
    })
    .join(', ')

  // links to bundle browser builds
  const depVizUrl = `${BUILD_LINK_BASE}/build-artifacts/deps-viz/background/index.html`
  const depVizLink = `<a href="${depVizUrl}">background</a>`

  // link to artifacts
  const allArtifactsUrl = `https://circleci.com/gh/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/${CIRCLE_BUILD_NUM}#artifacts/containers/0`

  const contentRows = [
    `builds: ${buildLinks}`,
    `bundle viz: ${bundleLinks}`,
    `dep viz: ${depVizLink}`,
    `<a href="${allArtifactsUrl}">all artifacts</a>`,
  ]
  const hiddenContent =
    `<ul>` + contentRows.map((row) => `<li>${row}</li>`).join('\n') + `</ul>`
  const exposedContent = `Builds ready [${SHORT_SHA1}]`
  const artifactsBody = `<details><summary>${exposedContent}</summary>${hiddenContent}</details>`

  const benchmarkResults = {}
  for (const platform of platforms) {
    const benchmarkPath = path.resolve(
      __dirname,
      '..',
      path.join('test-artifacts', platform, 'benchmark', 'pageload.json')
    )
    try {
      const data = await fs.readFile(benchmarkPath, 'utf8')
      const benchmark = JSON.parse(data)
      benchmarkResults[platform] = benchmark
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`No benchmark data found for ${platform}; skipping`)
      } else {
        console.error(
          `Error encountered processing benchmark data for '${platform}': '${error}'`
        )
      }
    }
  }

  let commentBody
  if (!benchmarkResults.chrome) {
    console.log(`No results for Chrome found; skipping benchmark`)
    commentBody = artifactsBody
  } else {
    try {
      const chromePageLoad = Math.round(
        parseFloat(benchmarkResults.chrome.notification.average.load)
      )
      const chromePageLoadMarginOfError = Math.round(
        parseFloat(benchmarkResults.chrome.notification.marginOfError.load)
      )
      const benchmarkSummary = `Page Load Metrics (${chromePageLoad} ± ${chromePageLoadMarginOfError} ms)`

      const allPlatforms = new Set()
      const allPages = new Set()
      const allMetrics = new Set()
      const allMeasures = new Set()
      for (const platform of Object.keys(benchmarkResults)) {
        allPlatforms.add(platform)
        const platformBenchmark = benchmarkResults[platform]
        const pages = Object.keys(platformBenchmark)
        for (const page of pages) {
          allPages.add(page)
          const pageBenchmark = platformBenchmark[page]
          const measures = Object.keys(pageBenchmark)
          for (const measure of measures) {
            allMeasures.add(measure)
            const measureBenchmark = pageBenchmark[measure]
            const metrics = Object.keys(measureBenchmark)
            for (const metric of metrics) {
              allMetrics.add(metric)
            }
          }
        }
      }

      const tableRows = []
      for (const platform of allPlatforms) {
        const pageRows = []
        for (const page of allPages) {
          const metricRows = []
          for (const metric of allMetrics) {
            let metricData = `<td>${metric}</td>`
            for (const measure of allMeasures) {
              metricData += `<td align="right">${Math.round(
                parseFloat(benchmarkResults[platform][page][measure][metric])
              )}</td>`
            }
            metricRows.push(metricData)
          }
          metricRows[0] = `<td rowspan="${
            allMetrics.size
          }">${capitalizeFirstLetter(page)}</td>${metricRows[0]}`
          pageRows.push(...metricRows)
        }
        pageRows[0] = `<td rowspan="${allPages.size *
          allMetrics.size}">${capitalizeFirstLetter(platform)}</td>${
          pageRows[0]
        }`
        for (const row of pageRows) {
          tableRows.push(`<tr>${row}</tr>`)
        }
      }

      const benchmarkTableHeaders = ['Platform', 'Page', 'Metric']
      for (const measure of allMeasures) {
        benchmarkTableHeaders.push(`${capitalizeFirstLetter(measure)} (ms)`)
      }
      const benchmarkTableHeader = `<thead><tr>${benchmarkTableHeaders
        .map((header) => `<th>${header}</th>`)
        .join('')}</tr></thead>`
      const benchmarkTableBody = `<tbody>${tableRows.join('')}</tbody>`
      const benchmarkTable = `<table>${benchmarkTableHeader}${benchmarkTableBody}</table>`
      const benchmarkBody = `<details><summary>${benchmarkSummary}</summary>${benchmarkTable}</details>`
      commentBody = `${artifactsBody}${benchmarkBody}`
    } catch (error) {
      console.error(`Error constructing benchmark results: '${error}'`)
      commentBody = artifactsBody
    }
  }

  const JSON_PAYLOAD = JSON.stringify({ body: commentBody })
  const POST_COMMENT_URI = `https://api.github.com/repos/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/issues/${CIRCLE_PR_NUMBER}/comments`
  console.log(`Announcement:\n${commentBody}`)
  console.log(`Posting to: ${POST_COMMENT_URI}`)

  await fetch(POST_COMMENT_URI, {
    method: 'POST',
    body: JSON_PAYLOAD,
    headers: {
      'User-Agent': 'confluxbot',
      Authorization: `token ${GITHUB_COMMENT_TOKEN}`,
    },
  })
}
