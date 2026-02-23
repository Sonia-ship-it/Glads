import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { TeamService } from './team.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from '../common/dto/team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Team')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post(':branchId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create team member',
    description: 'Add a new team member. Admin only.',
  })
  @ApiParam({ name: 'branchId', description: 'Branch ID', example: 'uuid-branch-id' })
  @ApiBody({ type: CreateTeamMemberDto })
  @ApiResponse({ status: 201, description: 'Team member created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Param('branchId') branchId: string, @Body() createDto: CreateTeamMemberDto) {
    return this.teamService.create(branchId, createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all team members',
    description: 'Retrieve all active team members',
  })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
  @ApiResponse({ status: 200, description: 'Team members retrieved successfully' })
  findAll(@Query('branchId') branchId?: string, @Query('department') department?: string) {
    return this.teamService.findAll(branchId, department);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get team member by ID',
    description: 'Retrieve detailed team member information',
  })
  @ApiParam({ name: 'id', description: 'Team member ID', example: 'uuid-member-id' })
  @ApiResponse({ status: 200, description: 'Team member retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  findOne(@Param('id') id: string) {
    return this.teamService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update team member',
    description: 'Update team member details. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Team member ID', example: 'uuid-member-id' })
  @ApiBody({ type: UpdateTeamMemberDto })
  @ApiResponse({ status: 200, description: 'Team member updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  update(@Param('id') id: string, @Body() updateDto: UpdateTeamMemberDto) {
    return this.teamService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete team member',
    description: 'Soft delete team member. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Team member ID', example: 'uuid-member-id' })
  @ApiResponse({ status: 200, description: 'Team member deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.teamService.remove(id);
  }
}
