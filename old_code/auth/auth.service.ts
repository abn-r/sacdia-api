import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { SignupDto } from "./dto/signup.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Injectable()
export class AuthService {

  private supabaseClient: SupabaseClient
  constructor() {
    this.supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  }

  async signInUser(dto: SignupDto) {
    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    })

    return {
      user: data.user,
      session: data.session,
      error: error
    }
  }

  async signupUser(dto: SignupDto) {

    const { data, error } = await this.supabaseClient.auth.signUp(
      { email: dto.email, password: dto.password }
      /*,{
        data: { 
          first_name: 'John', 
          age: 27,
        }
      }*/
    )

    return {
      user: data.user,
      session: data.session,
      error: error
    }
  }

  async ResetPassword(dto: ResetPasswordDto) {
    const { data, error } = await this.supabaseClient.auth.resetPasswordForEmail(dto.email, {
      redirectTo: 'https://example.com/update-password',
    })
  }

  async signOutUser() {
    const { error } = await this.supabaseClient.auth.signOut({ scope: 'global' })
    console.log({ error, message: 'Data signed out' })

    return { error: error, message: 'User signed out fake' }
  }
}