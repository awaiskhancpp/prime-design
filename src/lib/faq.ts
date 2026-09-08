export type FaqItem = { question: string; answer: string }

export type FaqCategory = { title: string; items: FaqItem[] }

export const faqCategories: FaqCategory[] = [
  {
    title: 'About Us Questions',
    items: [
      { question: "What sets Prime Design & Build apart from other kitchen remodeling companies?", answer: "At Prime Design & Build, we stand out by combining innovative design, superior craftsmanship, and a commitment to customer satisfaction. Our team of experienced professionals ensures that every kitchen remodel is executed with the utmost precision and attention to detail." },
    ],
  },
  {
    title: 'ADU Questions',
    items: [
      { question: "What does the process of designing and building an ADU with Prime Design and Build entail?", answer: "Our process begins with a consultation to understand your needs and vision for the ADU. We then conduct a site assessment to evaluate your property's suitability for an ADU project. Following this, our design team crafts a custom ADU plan that aligns with your preferences and complies with local regulations. After design approval, we handle all the necessary permits before our skilled construction team brings your ADU to life. Throughout the project, we ensure open communication and transparency, keeping you informed and involved at every step." },
      { question: "Are there specific regulations for building an ADU in my area?", answer: "Yes, ADU construction regulations vary by location, taking into account zoning laws, size limitations, and property boundaries. Prime Design and Build specializes in navigating these regulations, ensuring your ADU project complies with all local building codes and zoning requirements. Our team stays updated on the latest rules to provide you with a smooth, hassle-free construction process." },
      { question: "What is an ADU and how can it benefit my property?", answer: "An Accessory Dwelling Unit (ADU) is a secondary housing unit on the same property as your main residence. These versatile structures can serve as a guest house, rental unit, or home office. Incorporating an ADU into your property can significantly enhance its value by adding livable space. It's also a great way to generate rental income or accommodate extended family in close proximity, while maintaining privacy." },
    ],
  },
  {
    title: 'Bathroom Remodel Questions',
    items: [
      { question: "Can you help me select the right fixtures and materials for my bathroom remodel?", answer: "Absolutely! We understand that choosing the right fixtures and materials is crucial for a successful bathroom remodel. Our team of design experts can assist you in selecting the perfect fixtures, including faucets, sinks, showerheads, and lighting, that match your desired style and functionality. We also offer a wide range of high-quality materials, such as tiles, countertops, and cabinetry, to create a cohesive and visually appealing bathroom design." },
      { question: "How long does a bathroom remodel typically take?", answer: "The duration of a bathroom remodel can vary depending on the scope of the project, complexity, and selected materials. Generally, bathroom remodels can take several weeks to complete. During the initial consultation, we'll assess your specific requirements and provide you with a timeframe tailored to your project. Our goal is to deliver high-quality results within a reasonable timeframe while minimizing disruptions to your daily routine." },
      { question: "Can you assist me in designing a bathroom that maximizes space?", answer: "Absolutely! Our team specializes in designing bathrooms that maximize space utilization, regardless of the size or layout. We offer creative solutions such as space-saving fixtures, smart storage options, and efficient layouts that optimize every inch of your bathroom. With our expertise, we'll transform your bathroom into a functional and inviting space that meets your needs." },
      { question: "What are the benefits of remodeling my bathroom?", answer: "Remodeling your bathroom can bring numerous benefits, including improved functionality, enhanced aesthetics, increased property value, and a more enjoyable and relaxing space. Whether you're looking to update outdated fixtures, create a spa-like retreat, or maximize storage and organization, our bathroom remodeling services can help you achieve your goals." },
    ],
  },
  {
    title: 'Complete Renovations Questions',
    items: [
      { question: "How does Prime Design and Build ensure the renovation reflects my personal style and needs?", answer: "At Prime Design and Build, we begin each renovation project with an in-depth consultation to thoroughly understand your vision, preferences, and lifestyle requirements. Our design team then collaborates with you to create a personalized renovation plan, incorporating your style preferences and functional needs into every aspect of the design. We provide detailed renderings and material samples to help you visualize the final outcome, ensuring that every decision made reflects your personal taste and the unique character of your home. Throughout the renovation process, we maintain open lines of communication, allowing for adjustments and refinements to ensure the end result perfectly aligns with your vision." },
      { question: "How long does a full-scale renovation project typically take?", answer: "The timeline for a complete renovation varies depending on the project's complexity, the size of your home, and the extent of changes being made. On average, a full-scale renovation can take anywhere from a few months to over a year. At Prime Design and Build, we prioritize efficient project management without compromising on quality. During our initial consultation, we'll provide you with a project timeline estimate, taking into account all your specific needs and any potential challenges that could arise, to ensure a realistic completion date." },
      { question: "What exactly does a complete renovation entail with Prime Design and Build?", answer: "A complete renovation with Prime Design and Build is a comprehensive overhaul of your existing space, transforming it to meet your current needs and aesthetic preferences. This process can include updating the layout, replacing the flooring, renovating kitchens and bathrooms, upgrading electrical and plumbing systems, and enhancing the exterior facade. Our goal is to reimagine your space to better suit your lifestyle, incorporating both functionality and modern design elements to create a home that feels both new and uniquely yours." },
    ],
  },
  {
    title: 'Custom Kitchen Questions',
    items: [
      { question: "How involved can I be in the design process of my custom kitchen?", answer: "At Prime Design & Build, we believe in collaborative design processes. We encourage your active participation in the design of your custom kitchen. Our team will work closely with you to understand your requirements, offer expert guidance, and incorporate your ideas and personal style into the design. Your vision" },
      { question: "What are the advantages of a custom kitchen?", answer: "A custom kitchen offers numerous advantages, including tailored design to match your specific needs and preferences, enhanced functionality, and optimal use of space. With a custom kitchen, you have the freedom to choose the layout, materials, finishes, and storage solutions that best suit your lifestyle and aesthetic preferences." },
      { question: "Can you customize the design of my kitchen according to my specific preferences?", answer: "Absolutely! We specialize in custom kitchen designs tailored to your unique style and needs. From the layout and cabinetry to the selection of materials and finishes, we work closely with you to bring your vision to life and create a kitchen that reflects your individual taste." },
      { question: "How can I make my kitchen more energy-efficient during the remodel?", answer: "Creating an energy-efficient kitchen is not only beneficial for the environment but can also save you money in the long run. There are several ways to make your kitchen more energy-efficient during the remodel. These include: 1. Upgrading to energy-efficient appliances with ENERGY STAR ratings. 2. Installing LED lighting fixtures that consume less electricity. 3. Incorporating natural lighting through strategic window placement or skylights. 4. Enhancing insulation in walls, floors, and ceilings to reduce heat loss. 5. Choosing energy-efficient windows and doors to minimize heat transfer." },
      { question: "How can I maximize storage space in my kitchen remodel?", answer: "Maximizing storage space in your kitchen remodel is a common concern. Our team of professionals can help you design a kitchen layout that optimizes storage capacity. We offer various solutions such as incorporating tall cabinets, installing pull-out drawers and shelves, utilizing corner spaces effectively, and utilizing innovative storage accessories. By customizing the design to your needs and preferences, we can help you create a functional and organized kitchen with ample storage." },
    ],
  },
  {
    title: 'European Kitchen Questions',
    items: [
      { question: "Can you help me incorporate European design elements into my kitchen remodel?", answer: "Absolutely! Our team specializes in European kitchen designs and can help you incorporate key elements into your remodel. From selecting European-inspired cabinetry styles to integrating modern appliances and maximizing storage efficiency, we'll work closely with you to create a stunning European-inspired kitchen that suits your taste and lifestyle." },
      { question: "What are the key features of a European kitchen design?", answer: "European kitchens are known for their sleek, modern aesthetics and functional design. They often feature clean lines, minimalist cabinetry, and integrated appliances. European kitchens prioritize efficiency and utilize space-saving solutions, making them perfect for contemporary homes and those seeking a sophisticated and streamlined look." },
    ],
  },
  {
    title: 'Finance Questions',
    items: [
      { question: "How can I qualify for financing with Prime Design & Build?", answer: "Qualifying for financing with Prime Design & Build is a straightforward process. Our financing specialists will assess your financial situation, credit history, and income to determine your eligibility. We strive to make the process as seamless as possible, and our team is here to assist you every step of the way." },
      { question: "What financing options do you offer for kitchen remodels?", answer: "At Prime Design & Build, we understand that financing plays a crucial role in making your dream kitchen a reality. We offer flexible financing options to accommodate various budgets and financial situations. Our team can guide you through the available options, including home equity loans, personal loans, and credit card financing, to find the best solution for you." },
      { question: "Will remodeling a kitchen add value to my home?", answer: "Remodeling your kitchen can undoubtedly add value to your home. The kitchen is a central focal point and a significant factor in potential buyers' decision-making process. However, the exact value added can vary depending on various factors, such as the quality of the remodel, current market conditions, and other considerations. While a kitchen remodel is an investment that can yield positive returns, it's important to have realistic expectations and not expect to recoup every penny spent." },
      { question: "How do I finance a kitchen remodel?", answer: "Financing a kitchen remodel can be approached in various ways. One popular method is through a home equity loan or line of credit, leveraging the equity in your home. These options often offer lower interest rates due to their secured nature. Personal loans or low to no-interest credit cards are alternative financing options. We recommend thoroughly researching each option and consulting with a financial advisor to determine the best fit for your specific circumstances." },
    ],
  },
  {
    title: 'General Questions',
    items: [
      { question: "How can Prime Design & Build help me create my dream kitchen?", answer: "Prime Design & Build offers a comprehensive range of services to bring your dream kitchen to life. From the initial design consultation to the selection of materials, installation, and final touches, our team will guide you through every step of the process. We take pride in our attention to detail and work closely with you to understand your vision, resulting in a personalized kitchen that reflects your style and enhances your lifestyle." },
      { question: "Can you help me choose the right materials and finishes for my kitchen remodel?", answer: "Certainly! Our experienced design team can assist you in selecting the ideal materials and finishes for your kitchen remodel. We offer a wide range of high-quality options, including countertop materials, flooring, cabinetry styles, and hardware. We'll work closely with you to ensure that the chosen materials align with your vision and meet your functional and aesthetic requirements." },
      { question: "How can Prime Design & Build help me create my dream kitchen?", answer: "Prime Design & Build offers a comprehensive range of services to bring your dream kitchen to life. From the initial design consultation to the selection of materials, installation, and final touches, our team will guide you through every step of the process. We take pride in our attention to detail and work closely with you to understand your vision, resulting in a personalized kitchen that reflects your style and enhances your lifestyle." },
      { question: "How long does a kitchen renovation take?", answer: "The duration of a kitchen renovation can vary depending on several factors. Factors such as the scope of the project, complexity, materials, and the current workload of our team can influence the timeline. Generally, we advise clients to anticipate several weeks for completion from the moment materials are decided upon. Custom cabinetry, for example, typically requires around eight to ten weeks for production. Once all materials are ready, the installation process can usually be completed within a few weeks." },
    ],
  },
  {
    title: 'Home Remodel Questions',
    items: [
      { question: "How long does a typical home remodeling project take?", answer: "The duration of a home remodeling project can vary depending on the scope and complexity of the project. Smaller projects, such as a kitchen remodel, may take several weeks, while larger-scale renovations may span several months. During our initial consultation, we'll assess your specific project requirements and provide you with a realistic timeline. Our team is committed to completing projects efficiently without compromising on quality, ensuring that you can enjoy your newly remodeled space as soon as possible." },
      { question: "Do you provide design services for home remodeling?", answer: "Absolutely! We understand that the design phase is crucial in creating a home that reflects your unique style and meets your functional needs. Our experienced design team will work closely with you to understand your preferences, lifestyle, and budget. We'll provide expert guidance and innovative ideas to optimize your space, incorporating the latest trends and design elements. Whether you're looking for a contemporary, traditional, or transitional design, we'll bring your vision to life with meticulous attention to detail and a focus on creating a beautiful and functional living environment." },
      { question: "Can I make changes to the design or scope of the project once it has started?", answer: "At Prime Design & Build, we understand that changes may arise during the course of a home remodeling project. While we strive to create a detailed plan and ensure clear communication during the design phase, we recognize that you may have new ideas or preferences that you'd like to incorporate. We are flexible and open to accommodating changes whenever possible." },
      { question: "What types of home remodeling projects do you specialize in?", answer: "At Prime Design & Build, we specialize in a wide range of home remodeling projects, including kitchen remodeling, bathroom remodeling, basement finishing, room additions, and whole-house renovations. Whether you're looking to transform your kitchen into a culinary haven or create a luxurious bathroom retreat, our experienced team has the expertise to bring your vision to life." },
    ],
  },
  {
    title: 'Kitchen Remodel Questions',
    items: [
      { question: "What are the typical stages of a kitchen remodel?", answer: "A kitchen remodel involves several stages, and we will guide you through each one to ensure a seamless process. Here's an overview of the typical stages: Demolition: Removing old cabinetry, walls, sinks, and appliances to make way for the new design. Plumbing: If necessary, update or replace plumbing components to accommodate the new layout. Electrical: Upgrading electrical systems and installing new lighting fixtures. Drywall: Installing new drywall for a fresh, smooth surface. Paint: Applying paint in your chosen colors to enhance the aesthetic appeal. Flooring: Installing new flooring materials and baseboards. Cabinetry: Delivering and installing the new cabinetry. Countertops: Installing the selected countertops on top of the cabinetry. Backsplash: Adding a stylish backsplash to complement the design. Appliances: Installing new appliances and adding any final hardware to the cabinetry." },
      { question: "What can I do to plan for a kitchen remodel?", answer: "To start planning your kitchen remodel, we recommend seeking design inspiration from magazines or online sources. This will help you form a clear vision of the look and style you desire for your new kitchen. Having a clear idea in mind speeds up the design process. Once you've narrowed down your options, we encourage you to schedule a consultation with our professionals. During the consultation, we will discuss your ideas, preferences, and goals for the remodel. Before any work can commence, you'll need to clear out the area and remove personal belongings to ensure a smooth transition on the scheduled workday." },
    ],
  },
  {
    title: 'Outdoor Hardscape Questions',
    items: [
      { question: "Will hardscape increase my property value?", answer: "Yes. Professionally designed outdoor living spaces improve curb appeal, functionality, and overall property value." },
      { question: "How long does a hardscape project take?", answer: "Project timelines vary depending on size and complexity, but most installations take anywhere from several days to a few weeks." },
      { question: "What is included in hardscape services?", answer: "Hardscape services include patios, pavers, walkways, retaining walls, fire pits, seating walls, and other structural outdoor elements designed to enhance both functionality and aesthetics." },
    ],
  },
  {
    title: 'Outdoor Kitchen Questions',
    items: [
      { question: "What materials are best for outdoor kitchens?", answer: "We use weather-resistant materials such as stainless steel, natural stone, concrete, and sealed pavers to ensure durability and long-term performance." },
      { question: "Do outdoor kitchens require plumbing, gas, or electrical connections?", answer: "It depends on your design. Full outdoor kitchens may include gas lines, plumbing for sinks, and electrical connections for lighting and appliances. We evaluate your space and recommend the best setup." },
      { question: "What does the outdoor kitchen design and build process involve?", answer: "Our process includes consultation, custom design planning, material selection, permitting (if required), and professional installation. We manage everything from utilities to final finishes to ensure a seamless experience." },
    ],
  },
  {
    title: 'Room Additions Questions',
    items: [
      { question: "Can Prime Design and Build handle room additions on properties with limited space or unique landscapes?", answer: "Yes, we specialize in tackling challenging projects, including those on properties with limited space or unique landscapes. Our experienced team is skilled at coming up with creative solutions to maximize your property's potential, ensuring the new addition enhances both functionality and aesthetic appeal. We take into account the specifics of your property, adhering to regulations while achieving your desired outcome, even in the most complex situations." },
      { question: "What factors should I consider before deciding on a room addition?", answer: "Before embarking on a room addition project, consider your property's current layout, how the new space will be used, and your budget. It's also important to think about the long-term impact on your property's value and how the addition will blend with your existing home structure. Prime Design and Build will help you assess these factors, ensuring the addition meets your needs while complementing your home's aesthetic and increasing functionality." },
    ],
  },
  {
    title: 'Shaker Kitchen Questions',
    items: [
      { question: "Can you create a Shaker-style kitchen with modern elements?", answer: "Absolutely! Our team specializes in blending traditional design elements with modern aesthetics. If you're looking for a Shaker-style kitchen with a contemporary twist, we can incorporate modern finishes, hardware, and appliances while maintaining the core principles of Shaker design. The result is a beautiful, harmonious kitchen that combines the best of both worlds." },
      { question: "What defines a Shaker kitchen design?", answer: "Shaker kitchens are known for their simplicity, functionality, and timeless appeal. They feature clean lines, recessed panel doors, and minimal ornamentation. Shaker kitchens often showcase natural wood finishes, emphasizing the beauty of the materials. With their classic yet versatile style, Shaker kitchens can seamlessly complement various interior design themes." },
    ],
  },
  {
    title: 'Siding Questions',
    items: [
      { question: "Is new siding energy-efficient?", answer: "Yes. Modern siding options include insulated materials that improve your home's thermal performance." },
      { question: "How long does siding installation take?", answer: "Most siding projects take several days to a couple of weeks, depending on the size of the home and material selected." },
      { question: "What siding material is best for my home?", answer: "It depends on your budget, climate, and design preference. Vinyl is cost-effective, fiber cement offers durability, and wood provides a natural look." },
      { question: "How do I know if my siding needs replacement?", answer: "Signs include cracks, warping, fading, moisture damage, mold growth, or increased energy bills. A professional inspection can determine the best solution." },
    ],
  },
];

