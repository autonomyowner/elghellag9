import { Module } from '@nestjs/common';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { LandController } from './land.controller';
import { LandService } from './land.service';
import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';
import { VegetablesController } from './vegetables.controller';
import { VegetablesService } from './vegetables.service';
import { NurseriesController } from './nurseries.controller';
import { NurseriesService } from './nurseries.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  controllers: [
    EquipmentController,
    LandController,
    AnimalsController,
    VegetablesController,
    NurseriesController,
    CategoriesController,
  ],
  providers: [
    EquipmentService,
    LandService,
    AnimalsService,
    VegetablesService,
    NurseriesService,
    CategoriesService,
  ],
  exports: [
    EquipmentService,
    LandService,
    AnimalsService,
    VegetablesService,
    NurseriesService,
    CategoriesService,
  ],
})
export class ProductsModule {}
