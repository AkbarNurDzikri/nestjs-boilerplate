import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private extractRefreshToken(req: Request): string | undefined {
    // From cookies
    if (req.cookies && typeof req.cookies === 'object') {
      const cookieToken = (req.cookies as Record<string, string>)[
        'refresh_token'
      ];
      if (cookieToken) return cookieToken;
    }

    // From header
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.replace('Bearer ', '');
    }

    return undefined;
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'admin@google.com',
          description:
            'user email for login credential and reset password request',
        },
        name: {
          type: 'string',
          example: 'Salman Alfarizi',
          description: 'user profile display name',
        },
        password: {
          type: 'string',
          example: 'secrettext',
          description: 'text or number or alpha number combination',
        },
      },
      required: ['email', 'name', 'password'],
    },
  })
  async register(@Body() data: CreateUserDto) {
    return this.authService.register(data);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'admin@google.com',
          description: 'registered email',
        },
        password: {
          type: 'string',
          example: 'secrettext',
          description: 'registered password',
        },
      },
      required: ['email', 'password'],
    },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  async login(
    @Body() data: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(data, req, res);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.extractRefreshToken(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    return this.authService.refreshToken(refreshToken, req, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = this.extractRefreshToken(req);

    return this.authService.logout(refreshToken || '', res);
  }
}
