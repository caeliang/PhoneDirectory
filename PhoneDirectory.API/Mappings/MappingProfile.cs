using AutoMapper;
using PhoneDirectory.API.DTOs;
using PhoneDirectory.Core.Entities;

namespace PhoneDirectory.API.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Kisi Entity to DTO mappings
            CreateMap<Kisi, KisiDto>();
            
            CreateMap<CreateKisiDto, Kisi>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.Now))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.Now));
            
            CreateMap<UpdateKisiDto, Kisi>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.Now));
            
            CreateMap<KisiDto, Kisi>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.Now));

            // ApplicationUser Entity to DTO mappings
            CreateMap<ApplicationUser, UserDto>()
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.UserName))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true)); // Identity user aktif kabul ediyoruz
            
            CreateMap<RegisterDto, ApplicationUser>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Username))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.Now))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.Now));
        }
    }
}
