import { User } from '../../auth/models/User';
import { Project } from '../../projects/models/Project';
import { Task } from '../../tasks/models/Task';
import { Job } from '../../jobs/models/Job';
import { Post } from '../../posts/models/Post';

export interface PlatformMetrics {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  totalJobs: number;
  totalPosts: number;
  activeUsers: number;
}

export class AdminService {
  static async getGlobalMetrics(): Promise<PlatformMetrics> {
    const [totalUsers, totalProjects, totalTasks, totalJobs, totalPosts, activeUsers] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments(),
      Job.countDocuments(),
      Post.countDocuments(),
      User.countDocuments({ status: 'ACTIVE' })
    ]);

    return {
      totalUsers,
      totalProjects,
      totalTasks,
      totalJobs,
      totalPosts,
      activeUsers
    };
  }
}
