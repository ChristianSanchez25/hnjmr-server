import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoggerAdapter } from '../../common/adapters/logger.adapter';
import { MedicalSupplyService } from '../medical-supply.service';
import { CreateLotDto } from './dto/create-lot.dto';
import { UpdateLotDto } from './dto/update-lot.dto';
import { Lot } from './entities/lot.entity';
import { Supplier } from './entities/supplier.entity';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { Order } from '../../common/enums/order.enum';


@Injectable()
export class LotService {

  constructor(
    private readonly medicalSupplyService: MedicalSupplyService,
    @InjectRepository(Lot)
    private readonly lotRepository : Repository<Lot>,
    @InjectRepository(Supplier)
    private readonly supplierRepository : Repository<Supplier>,
    private readonly logger: LoggerAdapter,
  ) {}

  async create(createLotDto: CreateLotDto) {
    try {
      const { id_medical_supplies, id_suppliers = 1, ...lotDetails } = createLotDto;
      const medicalSupply = await this.medicalSupplyService.findOneById(id_medical_supplies);
      const supplier = await this.supplierRepository.findOne({ where: { id_suppliers: id_suppliers } });
      const lot = this.lotRepository.create({ ...lotDetails, medicalSupply, supplier });
      await this.lotRepository.save(lot);
      this.logger.log(`Created Lot with id ${lot.id_lots}`, 'LotService')
      return lot;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    let { limit = 20 , offset = 0, sort = 'date_delivery', order = Order.DESC } = paginationDto;
    if ( sort === 'name_material' || sort === 'description')
      sort = 'medicalSupply.' + sort;
    else
      sort = 'lots.' + sort;
    const lots = await this.lotRepository.createQueryBuilder('lots')
                      .leftJoinAndSelect('lots.medicalSupply', 'medicalSupply')
                      .leftJoinAndSelect('lots.supplier', 'supplier')
                      .take(limit)
                      .skip(offset)
                      .orderBy(sort, order)
                      .getMany();
    this.logger.log(`Found ${lots.length} lots`, 'LotService')
    return lots;
  }

  async findOneById(id: number) {
    const lot = await this.lotRepository.findOne({ 
      where: { id_lots: id },
      relations: ['medicalSupply', 'supplier'], });
    if (!lot) {
      throw new BadRequestException(`Lot with id ${id} not found`);
    }
    return lot;
  }

  async find(paginationDto: PaginationDto){
    if (paginationDto.search) {
      return await this.findByTerm(paginationDto);
    } else {
      return await this.findAll(paginationDto);
    }
  }


  async findByTerm( paginationDto: PaginationDto) {
    let { limit = 20 , offset = 0, sort = 'date_delivery', order = Order.DESC} = paginationDto;
    if ( sort === 'name_material' || sort === 'description')
      sort = 'medicalSupply.' + sort;
    else
      sort = 'lots.' + sort;
    const term = paginationDto.search;
    const lots = await this.lotRepository.createQueryBuilder('lots')
                     .leftJoinAndSelect('lots.medicalSupply', 'medicalSupply')
                     .leftJoinAndSelect('lots.supplier', 'supplier')
                     .where('lots.stock::text LIKE :term', { term: `%${term}%` })
                     .orWhere('lots.date_delivery::text LIKE :term', { term: `%${term}%` })
                     .orWhere('lots.due_date::text LIKE :term', { term: `%${term}%` })   
                     .orWhere('UPPER(medicalSupply.name_material) LIKE :term', { term: `%${term.toUpperCase()}%` }) 
                     .orWhere('UPPER(medicalSupply.description) LIKE :term', { term: `%${term.toUpperCase()}%` })                
                     .take(limit)
                     .skip(offset)
                     .orderBy(sort, order)
                     .getMany();
    this.logger.log(`Found ${lots.length} lots`, 'LotService')
    return lots;
  }

  async update(id: number, updateLotDto: UpdateLotDto) {
    const { id_medical_supplies, id_suppliers, ...lotDetails } = updateLotDto;
    const lot = await this.lotRepository.preload({
      id_lots: id,
      ...lotDetails,
    })
    if (!lot) {
      throw new NotFoundException('Lot not found');
    }
    try {
      if (id_medical_supplies){
        lot.medicalSupply = await this.medicalSupplyService.findOneById(id_medical_supplies);
      }
      if (id_suppliers){
        lot.supplier = await this.supplierRepository.findOne({ where: { id_suppliers: id_suppliers } });
      }
      await this.lotRepository.save(lot);
      this.logger.log(`Updated lot with id ${id}`, 'LotService');
      return lot;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: number) {
    const lot = await this.findOneById(id);
    this.lotRepository.remove(lot);
    this.logger.log(`Removed Lot with id ${id}`, 'LotService');
  }

  async deleteAllLots() {
    const query = this.lotRepository.createQueryBuilder();
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllSuppliers() {
    const suppliers = await this.supplierRepository.find();
    this.logger.log(`Found ${suppliers.length} suppliers`, 'LotService')
    return suppliers;
  }

  private handleError(error: any) {
    this.logger.error(error.message, 'LotService');
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException('Error check logs ');
  }

}
