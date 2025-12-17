export interface UserRequirements {
  plotSize: string;
  floors: string;
  bedrooms: string;
  bathrooms: string;
  style: string;
  requirements: string;
}

export interface RoomSize {
  room: string;
  area: string;
}

export interface PlanOption {
  id: number;
  name: string;
  concept: string;
  roomSizes: RoomSize[];
  totalAreaUsed: string;
  layoutDescription: string;
  uniqueAspects: string;
  pros: string[];
  cons: string[];
}

export interface GenerationResponse {
  options: PlanOption[];
}
