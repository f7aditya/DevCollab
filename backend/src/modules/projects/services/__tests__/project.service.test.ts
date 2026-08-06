import { ProjectService } from '../project.service';
import { ProjectRepository } from '../../repositories/project.repository';
import { ProjectRoleRepository } from '../../repositories/projectRole.repository';
import mongoose from 'mongoose';
import { AppError } from '../../../../core/errors/AppError';

// Mock dependencies
jest.mock('../../repositories/project.repository');
jest.mock('../../repositories/projectRole.repository');
jest.mock('mongoose', () => ({
  startSession: jest.fn(),
}));

describe('ProjectService', () => {
  let mockSession: any;

  beforeEach(() => {
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    (mongoose.startSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('createProject', () => {
    it('should create a project and assign the owner role within a transaction', async () => {
      const mockProject = { id: 'project-123', name: 'Test Project' };
      const userId = 'user-123';
      const input = { name: 'Test Project', description: 'desc' };

      (ProjectRepository.create as jest.Mock).mockResolvedValue(mockProject);
      (ProjectRoleRepository.create as jest.Mock).mockResolvedValue({});

      const result = await ProjectService.createProject(input as any, userId);

      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      
      expect(ProjectRepository.create).toHaveBeenCalledWith(
        { ...input, ownerId: userId }, 
        mockSession
      );
      
      expect(ProjectRoleRepository.create).toHaveBeenCalledWith(
        'project-123', 
        userId, 
        'OWNER', 
        mockSession
      );

      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toEqual(mockProject);
    });

    it('should abort transaction if project creation fails', async () => {
      const userId = 'user-123';
      const input = { name: 'Test Project', description: 'desc' };

      (ProjectRepository.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(ProjectService.createProject(input as any, userId)).rejects.toThrow('DB Error');

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });
});
