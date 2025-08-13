import { Module } from '@nestjs/common';
import { BatteryService } from './battery.service';
import { BatteryController } from './battery.controller';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [WeatherModule], // Import WeatherModule to use WeatherService
  providers: [BatteryService],
  controllers: [BatteryController],
  exports: [BatteryService],
})
export class BatteryModule {}
