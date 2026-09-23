import { Role } from '@prisma/client';
import { AdminBlogController } from './admin-blog.controller';

describe('AdminBlogController', () => {
  it('creates a blog and records an audit entry', async () => {
    const blogService = { create: jest.fn().mockResolvedValue({ id: 'blog-1', title: 'Test' }) } as any;
    const audit = { record: jest.fn() };
    const controller = new AdminBlogController(blogService, audit as any);
    const actor = { id: 'admin-1', email: 'a@a.com', role: Role.ADMIN, isMasterAdmin: true, adminPermissions: [] };

    const result = await controller.create({ title: 'Test', content: 'x' } as any, actor);

    expect(blogService.create).toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledWith('admin-1', 'CREATE_BLOG', 'Blog', 'blog-1', expect.any(Object));
    expect(result.id).toBe('blog-1');
  });

  it('records an audit entry on delete', async () => {
    const blogService = { delete: jest.fn().mockResolvedValue(undefined) } as any;
    const audit = { record: jest.fn() };
    const controller = new AdminBlogController(blogService, audit as any);
    const actor = { id: 'admin-1', email: 'a@a.com', role: Role.ADMIN, isMasterAdmin: true, adminPermissions: [] };

    await controller.delete('blog-1', actor);

    expect(blogService.delete).toHaveBeenCalledWith('blog-1');
    expect(audit.record).toHaveBeenCalledWith('admin-1', 'DELETE_BLOG', 'Blog', 'blog-1');
  });
});