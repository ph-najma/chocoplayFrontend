import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { environment } from '../../../environments/environment.prod';
type ValidateResponse = {
  ok: boolean;
  message: string;
  redirectTo?: string;
};

@Component({
  selector: 'app-access',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './access.component.html',
  styleUrl: './access.component.css',
})
export class AccessComponent {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly apiOrigin = new URL(this.apiBaseUrl).origin;

  readonly form = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^CHOCO-[A-Z0-9]{5,}$/),
      ],
    }),
  });

  isSubmitting = false;
  statusMessage = '';
  isError = false;

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.statusMessage = '';
    this.isError = false;

    const normalizedCode = this.form.controls.code.value.trim().toUpperCase();

    this.http
      .post<ValidateResponse>(`${this.apiBaseUrl}/access/validate`, {
        code: normalizedCode,
      })
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.isError = !response.ok;
          this.statusMessage = response.message;

          if (response.ok) {
            const redirectTarget = response.redirectTo ?? '/index.html';
            const finalRedirectUrl = this.resolveRedirectUrl(redirectTarget);
            setTimeout(() => {
              window.location.href = finalRedirectUrl;
            }, 900);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.isError = true;
          this.statusMessage =
            error?.error?.message ??
            'Unable to validate code. Please try again.';
        },
      });
  }

  private resolveRedirectUrl(redirectTarget: string): string {
    if (/^https?:\/\//i.test(redirectTarget)) {
      return redirectTarget;
    }

    // Relative paths should open from backend origin where static pages are served.
    return `${this.apiOrigin}${redirectTarget.startsWith('/') ? '' : '/'}${redirectTarget}`;
  }
}
