import { Controller, Get, Query } from '@nestjs/common';
import {
  BatteryService,
  BatteryStatus,
  BatteryRecommendation,
} from './battery.service';

@Controller('battery')
export class BatteryController {
  constructor(private readonly batteryService: BatteryService) {}

  @Get('status')
  async getBatteryStatus(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('charge') charge: string,
  ): Promise<BatteryStatus> {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const currentCharge = parseFloat(charge);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(currentCharge)) {
      throw new Error(
        'Invalid parameters. lat, lon, and charge must be numbers',
      );
    }

    if (currentCharge < 0 || currentCharge > 100) {
      throw new Error('Charge level must be between 0 and 100');
    }

    return this.batteryService.getBatteryStatus(
      latitude,
      longitude,
      currentCharge,
    );
  }

  @Get('recommendation')
  async getBatteryRecommendation(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('charge') charge: string,
  ): Promise<BatteryRecommendation> {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const currentCharge = parseFloat(charge);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(currentCharge)) {
      throw new Error(
        'Invalid parameters. lat, lon, and charge must be numbers',
      );
    }

    if (currentCharge < 0 || currentCharge > 100) {
      throw new Error('Charge level must be between 0 and 100');
    }

    return this.batteryService.getBatteryRecommendation(
      latitude,
      longitude,
      currentCharge,
    );
  }
}
