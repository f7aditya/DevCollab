import { Request, Response } from 'express';
import { catchAsync } from '../../../core/utils/catchAsync';
import { SearchService } from '../services/search.service';

export const SearchController = {
  globalSearch: catchAsync(async (req: Request, res: Response) => {
    const { q } = req.query;
    const userId = (req.user as any).id;
    
    if (!q || typeof q !== 'string') {
      return res.status(200).json({ success: true, data: { results: [] } });
    }

    const results = await SearchService.globalSearch(q, userId);
    
    res.status(200).json({
      success: true,
      data: { results }
    });
  })
};
