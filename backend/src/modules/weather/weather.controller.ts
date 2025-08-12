import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService, CurrentWeather } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  async getCurrentWeather(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ): Promise<CurrentWeather> {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid latitude or longitude');
    }
    
    return await this.weatherService.getCurrentWeather(latitude, longitude);
  }
}
