import {TestBed} from '@angular/core/testing';

import {ProjectServiceTsService} from './project.service';

describe('ProjectServiceTsService', () => {
  let service: ProjectServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
