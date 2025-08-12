import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface CurrentWeather {
  temperature: number;
  precipitation: number;
}

interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    precipitation: number;
  };
}

@Injectable()
export class WeatherService {
  constructor(private readonly httpService: HttpService) {}

  async getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation`;

    const response = await firstValueFrom(
      this.httpService.get<OpenMeteoResponse>(url),
    );

    const rawCurrentWeatherData = response.data;

    // Get the current weather data
    const currentTemperature = rawCurrentWeatherData.current.temperature_2m;
    const currentPrecipitation = rawCurrentWeatherData.current.precipitation;

    return {
      temperature: currentTemperature,
      precipitation: currentPrecipitation,
    };
  }
}
