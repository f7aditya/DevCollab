import { ProjectRoleRepository } from '../repositories/projectRole.repository';
import { AppError } from '../../../core/errors/AppError';
import { IProjectRole, ProjectRoleType } from '../models/ProjectRole';
import { InviteMemberInput, UpdateRoleInput } from '../dtos/projectRole.schema';
import { ProjectRepository } from '../repositories/project.repository';
import { User } from '../../auth/models/User';
import mongoose from 'mongoose';
import { GithubService } from './github.service';

export const ProjectRoleService = {
  async getMembers(projectId: string): Promise<IProjectRole[]> {
    // Verify project exists
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new AppError('Project not found', 404);

    return ProjectRoleRepository.findMembers(projectId);
  },

  async inviteMember(projectId: string, data: InviteMemberInput): Promise<IProjectRole> {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new AppError('Project not found', 404);

    let targetUserId = data.userId;
    if (!mongoose.Types.ObjectId.isValid(data.userId)) {
      const user = await User.findOne({ email: data.userId.toLowerCase().trim() });
      if (!user) throw new AppError('User not found with that email address', 404);
      targetUserId = user._id.toString();
    } else {
      const user = await User.findById(data.userId);
      if (!user) {
        const userByEmail = await User.findOne({ email: data.userId.toLowerCase().trim() });
        if (!userByEmail) throw new AppError('User not found', 404);
        targetUserId = userByEmail._id.toString();
      }
    }

    const existingRole = await ProjectRoleRepository.findRole(projectId, targetUserId);
    if (existingRole) {
      throw new AppError('User is already a member of this project', 400);
    }

    const createdRole = await ProjectRoleRepository.create(projectId, targetUserId, data.role);

    // Auto-invite to GitHub repository if configured
    try {
      if (project.links?.github) {
        const repoDetails = GithubService.parseRepoUrl(project.links.github);
        if (repoDetails) {
          const owner = await User.findById(project.ownerId).select('+githubAccessToken');
          const invitedUser = await User.findById(targetUserId);

          if (owner?.githubAccessToken && invitedUser?.githubUsername) {
             await GithubService.inviteCollaborator(
              owner.githubAccessToken,
              repoDetails.owner,
              repoDetails.repo,
              invitedUser.githubUsername
            );
          }
        }
      }
    } catch (err) {
      console.error('Failed to trigger GitHub auto-invite', err);
    }

    return createdRole;
  },

  async updateMemberRole(projectId: string, targetUserId: string, data: UpdateRoleInput, requesterId: string): Promise<IProjectRole> {
    // 1. You cannot demote yourself if you are the only owner (for safety). We would add logic here.
    // 2. You cannot modify the owner role unless you are the owner (already handled by RBAC).
    
    if (targetUserId === requesterId && data.role !== 'OWNER') {
      // Basic safeguard: owners shouldn't accidentally demote themselves without transferring ownership first.
      const currentRole = await ProjectRoleRepository.findRole(projectId, targetUserId);
      if (currentRole && currentRole.role === 'OWNER') {
        throw new AppError('Owners cannot demote themselves. Transfer ownership first.', 400);
      }
    }

    const updatedRole = await ProjectRoleRepository.updateRole(projectId, targetUserId, data.role);
    if (!updatedRole) {
      throw new AppError('Member not found in this project', 404);
    }

    return updatedRole;
  },

  async removeMember(projectId: string, targetUserId: string): Promise<void> {
    const roleEntry = await ProjectRoleRepository.findRole(projectId, targetUserId);
    if (!roleEntry) {
      throw new AppError('Member not found in this project', 404);
    }

    if (roleEntry.role === 'OWNER') {
      throw new AppError('Cannot remove the project owner. Transfer ownership first.', 400);
    }

    await ProjectRoleRepository.removeRole(projectId, targetUserId);
  },

  async leaveProject(projectId: string, userId: string): Promise<void> {
    const roleEntry = await ProjectRoleRepository.findRole(projectId, userId);
    if (!roleEntry) {
      throw new AppError('You are not a member of this project', 404);
    }

    if (roleEntry.role === 'OWNER') {
      throw new AppError('Owner cannot leave the project without transferring ownership or deleting the project.', 400);
    }

    await ProjectRoleRepository.removeRole(projectId, userId);
  },

  async transferOwnership(projectId: string, currentOwnerId: string, newOwnerId: string): Promise<void> {
    const currentOwnerRole = await ProjectRoleRepository.findRole(projectId, currentOwnerId);
    if (!currentOwnerRole || currentOwnerRole.role !== 'OWNER') {
      throw new AppError('You must be the project owner to transfer ownership', 403);
    }

    const newOwnerRole = await ProjectRoleRepository.findRole(projectId, newOwnerId);
    if (!newOwnerRole) {
      throw new AppError('The new owner must be a member of the project', 404);
    }

    // Use a transaction or sequential update to demote current owner to ADMIN and promote new owner to OWNER.
    // In our implementation, we'll do this sequentially for now.
    await ProjectRoleRepository.updateRole(projectId, newOwnerId, 'OWNER');
    await ProjectRoleRepository.updateRole(projectId, currentOwnerId, 'ADMIN');
  }
};
