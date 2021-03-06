import { QueryToken, OrderDescription } from 'reactivedb'
import { Observable } from 'rxjs/Observable'
import { SDK, CacheStrategy } from '../../SDK'
import { SDKFetch } from '../../SDKFetch'
import { ProjectId } from 'teambition-types'
import { PostSchema } from '../../schemas/Post'
import { pagination, omit } from '../../utils'

export type ProjectPostType = 'all' | 'my'

export interface GetPostsQuery<T extends ProjectPostType> {
  page: number
  type: T
  count: number
  fields?: string
  orderBy?: OrderDescription[]
  [index: string]: any
}

export function getPostsFetch<T extends ProjectPostType>(
  this: SDKFetch,
  _projectId: ProjectId,
  query: GetPostsQuery<T>
): Observable<PostSchema[]> {
  return this.get(`projects/${_projectId}/posts`, query)
}

SDKFetch.prototype.getPosts = getPostsFetch

declare module '../../SDKFetch' {
  interface SDKFetch {
    getPosts: typeof getPostsFetch
  }
}

export function getAllProjectPosts (
  this: SDK,
  _projectId: ProjectId,
  query?: GetPostsQuery<'all'>
): QueryToken<PostSchema> {
  const rdbQuery: any = {
    where: {
      _projectId,
      isArchived: false,
    },
    ...pagination(query.count, query.page)
  }
  if (query.orderBy) {
    rdbQuery.orderBy = query.orderBy
  }
  const urlQuery = omit(query, 'orderBy')
  return this.lift<PostSchema>({
    request: this.fetch.getPosts(_projectId, urlQuery),
    query: rdbQuery,
    tableName: 'Post',
    cacheValidate: CacheStrategy.Request,
    assocFields: {
      creator: ['_id', 'name', 'avatarUrl']
    }
  })
}

SDK.prototype.getAllProjectPosts = getAllProjectPosts

declare module '../../SDK' {
  export interface SDK {
    getAllProjectPosts: typeof getAllProjectPosts
  }
}
