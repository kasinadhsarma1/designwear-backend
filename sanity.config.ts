'use client'

/**
 * Sanity Studio config — DesignWear content & commerce hub.
 * Mounted at /designwear-studio
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { PublishAndSync } from './sanity/actions/PublishAndSync'
import { StudioLogo } from './sanity/components/StudioLogo'

export default defineConfig({
  basePath: '/designwear-studio',
  projectId,
  dataset,
  title: 'DesignWear Studio',
  icon: StudioLogo,
  schema,
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'product') {
        return prev.map((originalAction) => {
          if (originalAction.action === 'publish') {
            return PublishAndSync(originalAction)
          }
          return originalAction
        })
      }
      return prev
    },
  },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
