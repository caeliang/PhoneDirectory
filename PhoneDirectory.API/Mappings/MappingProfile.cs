using AutoMapper;
using PhoneDirectory.API.DTOs;
using PhoneDirectory.Core.Entities;

namespace PhoneDirectory.API.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Entity to DTO
            CreateMap<Kisi, KisiDto>();
            
            // DTO to Entity
            CreateMap<CreateKisiDto, Kisi>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.Now))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.Now));
            
            CreateMap<UpdateKisiDto, Kisi>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.Now));
            
            // Reverse mapping için
            CreateMap<KisiDto, Kisi>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.Now));
        }
    }
}
