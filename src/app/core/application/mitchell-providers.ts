import { AssessmentReadRepository, SessionReadRepository } from './persistence-read-models';
import { InjectionToken } from '@angular/core';
import { DogTrainingProfileRepository } from '../domain/training-plan/dog-training-profile';
import { TrainingPlanRepository } from '../domain/training-plan/training-plan.repository';
export const SKILL_ASSESSMENTS = new InjectionToken<AssessmentReadRepository>('SkillAssessments');
export const SYSTEM_SESSIONS = new InjectionToken<SessionReadRepository>('SystemSessions');
export const TRAINING_PROFILES = new InjectionToken<DogTrainingProfileRepository>(
  'TrainingProfiles',
);
export const TRAINING_PLANS = new InjectionToken<TrainingPlanRepository>('TrainingPlans');
