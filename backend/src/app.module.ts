import { Module } from '@nestjs/common';
import { WeatherModule } from './modules/weather/weather.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BatteryModule } from './modules/battery/battery.module';

@Module({
  imports: [WeatherModule, BatteryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
