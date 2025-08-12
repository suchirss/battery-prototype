import { Injectable } from '@nestjs/common';
import { WeatherService } from '../weather/weather.service';

export interface BatteryStatus {
  chargeLevel: number; // 0-100%
  isCharging: boolean;
  estimatedTimeToFull: number; // minutes
  recommendedAction: string;
  efficiency: number; // 0-1 (weather-adjusted)
}

export interface BatteryRecommendation {
  shouldCharge: boolean;
  optimalChargingTime: string;
  reason: string;
  weatherImpact: string;
}

@Injectable()
export class BatteryService {
  constructor(private readonly weatherService: WeatherService) {}

  async getBatteryStatus(
    lat: number,
    lon: number,
    currentCharge: number,
  ): Promise<BatteryStatus> {
    // Get current weather data
    const weather = await this.weatherService.getCurrentWeather(lat, lon);

    // Calculate weather impact on battery efficiency
    const efficiency = this.calculateWeatherEfficiency(
      weather.temperature,
      weather.precipitation,
    );

    // Determine if charging is recommended
    const isCharging = this.shouldStartCharging(currentCharge, efficiency);

    // Estimate time to full charge (adjusted for weather)
    const timeToFull = this.calculateTimeToFull(currentCharge, efficiency);

    return {
      chargeLevel: currentCharge,
      isCharging,
      estimatedTimeToFull: timeToFull,
      recommendedAction: this.getRecommendedAction(
        currentCharge,
        weather.temperature,
      ),
      efficiency,
    };
  }

  async getBatteryRecommendation(
    lat: number,
    lon: number,
    currentCharge: number,
  ): Promise<BatteryRecommendation> {
    const weather = await this.weatherService.getCurrentWeather(lat, lon);

    const shouldCharge = this.shouldStartCharging(
      currentCharge,
      this.calculateWeatherEfficiency(
        weather.temperature,
        weather.precipitation,
      ),
    );

    return {
      shouldCharge,
      optimalChargingTime: this.getOptimalChargingTime(weather.temperature),
      reason: this.getChargingReason(currentCharge, weather.temperature),
      weatherImpact: this.getWeatherImpactDescription(
        weather.temperature,
        weather.precipitation,
      ),
    };
  }

  private calculateWeatherEfficiency(
    temperature: number,
    precipitation: number,
  ): number {
    // Battery efficiency decreases in extreme temperatures
    let efficiency = 1.0;

    // Temperature impact (optimal range: 15-25°C)
    if (temperature < 0) {
      efficiency *= 0.7; // Cold weather reduces efficiency significantly
    } else if (temperature < 10) {
      efficiency *= 0.85;
    } else if (temperature > 35) {
      efficiency *= 0.9; // Hot weather also reduces efficiency
    } else if (temperature > 45) {
      efficiency *= 0.8;
    }

    // Precipitation impact (minimal for modern batteries)
    if (precipitation > 5) {
      efficiency *= 0.95; // Slight reduction due to humidity
    }

    return Math.max(efficiency, 0.5); // Minimum 50% efficiency
  }

  private shouldStartCharging(
    currentCharge: number,
    efficiency: number,
  ): boolean {
    // Charge if below 30% or if efficiency is good and below 80%
    return currentCharge < 30 || (efficiency > 0.9 && currentCharge < 80);
  }

  private calculateTimeToFull(
    currentCharge: number,
    efficiency: number,
  ): number {
    // Base charging time: ~2 hours for 0-100%
    const baseTimeMinutes = 120;
    const remainingCharge = 100 - currentCharge;
    const adjustedTime =
      ((remainingCharge / 100) * baseTimeMinutes) / efficiency;

    return Math.round(adjustedTime);
  }

  private getRecommendedAction(
    currentCharge: number,
    temperature: number,
  ): string {
    if (currentCharge < 20) {
      return 'Charge immediately - Low battery';
    }
    if (temperature < 0) {
      return 'Warm up battery before charging for optimal efficiency';
    }
    if (temperature > 35) {
      return 'Allow battery to cool before charging';
    }
    if (currentCharge < 50) {
      return 'Consider charging - Good conditions';
    }
    return 'Battery level optimal';
  }

  private getOptimalChargingTime(temperature: number): string {
    if (temperature < 5) {
      return 'Midday (when warmer)';
    }
    if (temperature > 30) {
      return 'Early morning or evening (when cooler)';
    }
    return 'Any time - conditions are optimal';
  }

  private getChargingReason(
    currentCharge: number,
    temperature: number,
  ): string {
    if (currentCharge < 30) {
      return 'Low battery level requires charging';
    }
    if (temperature >= 15 && temperature <= 25) {
      return 'Optimal temperature conditions for efficient charging';
    }
    return 'Preventive charging to maintain battery health';
  }

  private getWeatherImpactDescription(
    temperature: number,
    precipitation: number,
  ): string {
    let impact = '';

    if (temperature < 0) {
      impact = 'Cold weather significantly reduces battery efficiency';
    } else if (temperature < 10) {
      impact = 'Cool weather moderately reduces battery efficiency';
    } else if (temperature > 35) {
      impact = 'Hot weather reduces battery efficiency';
    } else {
      impact = 'Temperature conditions are optimal for battery performance';
    }

    if (precipitation > 5) {
      impact += '. High humidity may slightly affect charging';
    }

    return impact;
  }
}
