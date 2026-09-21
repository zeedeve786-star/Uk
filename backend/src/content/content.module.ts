import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { ServiceContentService } from './service-content.service';
import { VehicleContentService } from './vehicle-content.service';
import { PublicBlogController } from './public-blog.controller';
import { PublicServiceContentController } from './public-service-content.controller';
import { PublicVehicleContentController } from './public-vehicle-content.controller';

@Module({
  controllers: [PublicBlogController, PublicServiceContentController, PublicVehicleContentController],
  providers: [BlogService, ServiceContentService, VehicleContentService],
  exports: [BlogService, ServiceContentService, VehicleContentService],
})
export class ContentModule {}