import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  userProfile$: Observable<UserProfile | null>;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.userProfile$ = this.authService.getUserProfile$();
  }

  ngOnInit(): void {}

  async logout(): Promise<void> {
    this.isLoading = true;
    this.authService.logout().subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Logout error:', err);
      }
    });
  }
}