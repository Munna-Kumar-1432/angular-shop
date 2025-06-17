import { TestBed } from '@angular/core/testing';
import { AuthService, User } from './auth.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let store: {
    [key: string]: string;
  };

  beforeEach(() => {
    store = {};
    jest.spyOn(localStorage, 'getItem').mockImplementation((key: string) => store[key] || null);
    jest.spyOn(localStorage, 'setItem').mockImplementation((key: string, value: string) => (store[key] = value));
    jest.spyOn(localStorage, 'removeItem').mockImplementation((key: string) => {
      delete store[key];
    });
    jest.spyOn(localStorage, 'clear').mockImplementation(() => {
      store = {};
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: PLATFORM_ID,
          useValue: 'browser', // Mocking as if in a browser environment
        },
        {
          provide: 'isPlatformBrowser',
          useValue: () => true, // Mocking isPlatformBrowser to always return true for tests
        },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return current user as null initially', (done) => {
    service.currentUser$.subscribe((user) => {
      expect(user).toBeNull();
      done();
    });
  });

  it('should register a new user', (done) => {
    const success = service.signup('testuser', 'password');
    expect(success).toBe(true);
    service.currentUser$.subscribe(user => {
      expect(user?.name).toBe('testuser'); // Assuming signup also logs in or sets current user
      done();
    });
  });

  it('should not register an existing user', (done) => {
    service.signup('testuser', 'password');
    const success = service.signup('testuser', 'anotherpassword');
    expect(success).toBe(false);
    done();
  });

  it('should log in a registered user', (done) => {
    service.signup('testuser', 'password'); // Register first
    service.logout(); // Logout to ensure we're testing login explicitly

    service.login('testuser@example.com', 'password').subscribe((success) => {
      expect(success).toBe(true);
      service.currentUser$.subscribe((user) => {
        expect(user?.name).toBe('John Doe'); // Assuming default user name from login mock
        done();
      });
    });
  });

  it('should not log in with incorrect credentials', (done) => {
    service.signup('testuser', 'password');
    service.logout();

    service.login('wronguser@example.com', 'wrongpassword').subscribe((success) => {
      expect(success).toBe(false);
      service.currentUser$.subscribe((user) => {
        expect(user).toBeNull();
        done();
      });
    });
  });

  it('should log out a user', (done) => {
    service.signup('testuser', 'password');
    service.logout();

    service.currentUser$.subscribe((user) => {
      expect(user).toBeNull();
      done();
    });
  });

  it('should return true for isLoggedIn if user is logged in', (done) => {
    service.signup('testuser', 'password');
    service.isLoggedIn$.subscribe((isLoggedIn) => {
      expect(isLoggedIn).toBe(true);
      done();
    });
  });

  it('should return false for isLoggedIn if user is logged out', (done) => {
    service.signup('testuser', 'password');
    service.logout();
    service.isLoggedIn$.subscribe((isLoggedIn) => {
      expect(isLoggedIn).toBe(false);
      done();
    });
  });
}); 