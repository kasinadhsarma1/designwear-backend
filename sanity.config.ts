'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/designwear-studio/[[...tool]]/page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { PublishAndSync } from './sanity/actions/PublishAndSync'

export default defineConfig({
  basePath: '/designwear-studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
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
    }
  },
  plugins: [
    structureTool({ structure }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
