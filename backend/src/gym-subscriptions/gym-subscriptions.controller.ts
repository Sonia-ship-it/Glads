import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GymSubscriptionsService } from './gym-subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateGymSubscriptionDto,
  UpdateGymSubscriptionDto,
  RenewGymSubscriptionDto,
} from '../common/dto/gym-subscription.dto';

@ApiTags('Gym Subscriptions')
@Controller('gym-subscriptions')
export class GymSubscriptionsController {
  constructor(private readonly service: GymSubscriptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create gym subscription (Staff only)' })
  create(@Body() createDto: CreateGymSubscriptionDto) {
    return this.service.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all gym subscriptions' })
  findAll(@Query('branchId') branchId?: string) {
    return this.service.findAll(branchId);
  }

  @Get('member/:memberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscriptions by member' })
  findByMember(@Param('memberId') memberId: string) {
    return this.service.findByMember(memberId);
  }

  @Get('membership/:membershipNumber')
  @ApiOperation({ summary: 'Get subscription by membership number' })
  findByMembershipNumber(@Param('membershipNumber') membershipNumber: string) {
    return this.service.findByMembershipNumber(membershipNumber);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get gym subscription by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update gym subscription (Staff only)' })
  update(@Param('id') id: string, @Body() updateDto: UpdateGymSubscriptionDto) {
    return this.service.update(id, updateDto);
  }

  @Put(':id/renew')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renew gym subscription' })
  renew(@Param('id') id: string, @Body() renewDto: RenewGymSubscriptionDto) {
    return this.service.renew(id, renewDto);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel gym subscription' })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }
}
