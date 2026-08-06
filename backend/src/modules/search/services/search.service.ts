import { Project } from '../../projects/models/Project';
import { Task } from '../../tasks/models/Task';
import { Post } from '../../posts/models/Post';
import { User } from '../../auth/models/User';

export interface SearchResult {
  id: string;
  type: 'PROJECT' | 'TASK' | 'POST' | 'USER';
  title: string;
  subtitle?: string;
  link: string;
}

export class SearchService {
  static async globalSearch(query: string, userId: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const regex = new RegExp(query, 'i');
    
    // In a real production app, we would heavily filter based on what the user has access to.
    // For this demonstration, we query publicly visible data or assume the user has wide access.
    // We will limit to 5 per category to keep it fast and clean.
    
    const [projects, tasks, posts, users] = await Promise.all([
      Project.find({ name: regex }).limit(5),
      Task.find({ title: regex }).limit(5),
      Post.find({ title: regex }).limit(5),
      User.find({ $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] }).limit(5)
    ]);

    const results: SearchResult[] = [];

    projects.forEach(p => results.push({
      id: p._id .toString(),
      type: 'PROJECT',
      title: p.name,
      subtitle: p.description,
      link: `/projects/${p._id}`
    }));

    tasks.forEach(t => results.push({
      id: t._id .toString(),
      type: 'TASK',
      title: t.title,
      subtitle: `In Project ID: ${t.projectId}`,
      link: `/projects/${t.projectId}/tasks`
    }));

    posts.forEach(p => results.push({
      id: p._id .toString(),
      type: 'POST',
      title: p.title,
      subtitle: `In Project ID: ${p.projectId}`,
      link: `/projects/${p.projectId}`
    }));

    users.forEach(u => results.push({
      id: u._id .toString(),
      type: 'USER',
      title: `${u.firstName} ${u.lastName}`,
      subtitle: u.email,
      link: `/users/${u._id}`
    }));

    return results;
  }
}
