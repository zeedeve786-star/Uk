import { Controller, Get, Param } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('content/blogs')
export class PublicBlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  list() {
    return this.blogService.listPublished();
  }

  @Get(':slug')
  getOne(@Param('slug') slug: string) {
    return this.blogService.getPublishedBySlug(slug);
  }
}