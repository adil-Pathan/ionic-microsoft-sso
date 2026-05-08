import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController
  ) {}

  async loginWithMicrosoft(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      
      const loader = await this.loadingController.create({
        message: 'Signing in with Microsoft...'
      });
      await loader.present();

      this.authService.login();
      
      // Wait for authentication to complete
      setTimeout(async () => {
        await loader.dismiss();
        const token = this.authService.getAccessToken();
        if (token) {
          this.router.navigate(['/home']);
        }
      }, 2000);
    } catch (err: any) {
      this.isLoading = false;
      this.error = err.message || 'Login failed. Please try again.';
      console.error('Login error:', err);
    }
  }
}